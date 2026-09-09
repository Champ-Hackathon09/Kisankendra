import prisma from '../config/db.js';

export const getAllCentres = async (req, res) => {
  try {
    const centres = await prisma.centre.findMany({
      include: {
        _count: {
          select: {
            tokens: {
              where: {
                status: {
                  in: ['BOOKED', 'CALLED', 'IN_PROGRESS'],
                },
              },
            },
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    const formattedCentres = centres.map((c) => ({
      ...c,
      activeQueueCount: c._count.tokens,
    }));

    res.json({ success: true, centres: formattedCentres });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch centres', error: error.message });
  }
};

export const getCentreById = async (req, res) => {
  try {
    const { id } = req.params;
    const centre = await prisma.centre.findUnique({
      where: { id },
      include: {
        tokens: {
          where: {
            status: { in: ['BOOKED', 'CALLED', 'IN_PROGRESS'] },
          },
          orderBy: { queuePosition: 'asc' },
        },
      },
    });

    if (!centre) {
      return res.status(404).json({ success: false, message: 'Centre not found' });
    }

    res.json({ success: true, centre });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch centre', error: error.message });
  }
};

export const updateCentreStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { operationalStatus, pauseReason, capacityPerHour } = req.body;

    const validStatuses = ['NORMAL', 'RUSH', 'PAUSED'];
    if (operationalStatus && !validStatuses.includes(operationalStatus)) {
      return res.status(400).json({ success: false, message: 'Invalid status value' });
    }

    const updatedCentre = await prisma.centre.update({
      where: { id },
      data: {
        ...(operationalStatus && { operationalStatus }),
        ...(pauseReason !== undefined && { pauseReason }),
        ...(capacityPerHour !== undefined && { capacityPerHour: Number(capacityPerHour) }),
      },
    });

    res.json({
      success: true,
      message: 'Centre status updated successfully',
      centre: updatedCentre,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update status', error: error.message });
  }
};

export const createCentre = async (req, res) => {
  try {
    const { name, code, district, state, address, capacityPerHour = 5 } = req.body;

    if (!name || !code || !district || !state) {
      return res.status(400).json({ success: false, message: 'Required fields missing' });
    }

    const centre = await prisma.centre.create({
      data: {
        name,
        code,
        district,
        state,
        address: address || `${district}, ${state}`,
        capacityPerHour: Number(capacityPerHour),
      },
    });

    res.status(201).json({ success: true, centre });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create centre', error: error.message });
  }
};
