import prisma from '../config/db.js';

export const getCentreQueue = async (req, res) => {
  try {
    const { centreId } = req.params;

    const centre = await prisma.centre.findUnique({
      where: { id: centreId },
    });

    if (!centre) {
      return res.status(404).json({ success: false, message: 'Centre not found' });
    }

    const activeTokens = await prisma.token.findMany({
      where: {
        centreId,
        status: { in: ['BOOKED', 'CALLED', 'IN_PROGRESS'] },
      },
      include: {
        farmer: {
          select: { id: true, name: true, phone: true, village: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    const formatEta = (mins) => {
      const date = new Date(Date.now() + mins * 60000);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    // Currently at the weighbridge
    const inProgressRaw = activeTokens.find((t) => t.status === 'IN_PROGRESS') || null;
    const inProgressToken = inProgressRaw
      ? {
          ...inProgressRaw,
          fifoRank: 1,
          estimatedWaitMinutes: 0,
          estimatedClearanceTime: 'Active Now (Weighbridge)',
        }
      : null;

    // Called to gate
    let rankCounter = inProgressToken ? 2 : 1;
    const calledTokens = activeTokens
      .filter((t) => t.status === 'CALLED')
      .map((t, idx) => {
        const wait = (idx + 1) * 4;
        return {
          ...t,
          fifoRank: rankCounter++,
          estimatedWaitMinutes: wait,
          estimatedClearanceTime: `${formatEta(wait)} (At Gate)`,
        };
      });

    const capacityPerHour = centre.capacityPerHour || 5;
    const minPerVehicle = Math.max(8, Math.round(60 / capacityPerHour)); // 10-12 mins

    // Waiting in queue (Strict FIFO by creation timestamp)
    const waitingTokens = activeTokens
      .filter((t) => t.status === 'BOOKED')
      .map((t, idx) => {
        let wait;
        const isNext = idx === 0 && calledTokens.length === 0 && !inProgressToken;
        if (isNext) {
          wait = 4;
        } else {
          wait = (calledTokens.length * 4) + (inProgressToken ? 6 : 0) + (idx * minPerVehicle);
          if (wait < 4) wait = 4;
        }

        return {
          ...t,
          fifoRank: rankCounter++,
          estimatedWaitMinutes: wait,
          estimatedClearanceTime: isNext ? `${formatEta(wait)} (Next to Enter)` : formatEta(wait),
          isNextInLine: isNext,
        };
      });

    // Dynamic total wait calculation
    const estimatedTotalWaitMinutes =
      (inProgressToken ? 6 : 0) +
      (calledTokens.length * 4) +
      (waitingTokens.length * minPerVehicle);

    res.json({
      success: true,
      centre: {
        id: centre.id,
        name: centre.name,
        operationalStatus: centre.operationalStatus,
        pauseReason: centre.pauseReason,
        capacityPerHour: centre.capacityPerHour,
      },
      stats: {
        totalInQueue: activeTokens.length,
        estimatedTotalWaitMinutes,
        inProgressCount: inProgressToken ? 1 : 0,
        waitingCount: waitingTokens.length,
        calledCount: calledTokens.length,
      },
      inProgressToken,
      calledTokens,
      waitingTokens,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch queue', error: error.message });
  }
};

export const callNextToken = async (req, res) => {
  try {
    const { centreId } = req.params;

    // Find the earliest BOOKED token
    const nextToken = await prisma.token.findFirst({
      where: {
        centreId,
        status: 'BOOKED',
      },
      include: {
        farmer: {
          select: { id: true, name: true, phone: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    if (!nextToken) {
      return res.status(404).json({ success: false, message: 'No waiting tokens in the queue' });
    }

    const updatedToken = await prisma.token.update({
      where: { id: nextToken.id },
      data: {
        status: 'CALLED',
        estimatedWaitMinutes: 5,
      },
      include: {
        farmer: {
          select: { id: true, name: true, phone: true },
        },
      },
    });

    res.json({
      success: true,
      message: `Token ${updatedToken.tokenNumber} called to the gate!`,
      token: updatedToken,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to call next token', error: error.message });
  }
};
