import prisma from '../config/db.js';

export const bookToken = async (req, res) => {
  try {
    const { centreId, cropType, estimatedWeight, vehicleNumber, slotDate, slotTime } = req.body;
    const farmerId = req.user.id;

    if (!centreId || !cropType || !estimatedWeight || !slotDate || !slotTime) {
      return res.status(400).json({ success: false, message: 'All slot booking details are required' });
    }

    const centre = await prisma.centre.findUnique({
      where: { id: centreId },
    });

    if (!centre) {
      return res.status(404).json({ success: false, message: 'Procurement centre not found' });
    }

    if (centre.operationalStatus === 'PAUSED') {
      return res.status(400).json({
        success: false,
        message: `Centre is currently paused: ${centre.pauseReason || 'Maintenance'}. Please choose another centre or wait.`,
      });
    }

    // Check slot-specific capacity
    const activeTokensInSlot = await prisma.token.count({
      where: {
        centreId,
        slotDate,
        slotTime,
        status: { in: ['BOOKED', 'CALLED', 'IN_PROGRESS'] },
      },
    });

    const capacityPerHour = centre.capacityPerHour || 6;
    if (activeTokensInSlot >= capacityPerHour) {
      return res.status(400).json({
        success: false,
        message: `Arrival slot "${slotTime}" is full (${activeTokensInSlot}/${capacityPerHour} vehicles). Please select another time slot.`,
      });
    }

    // Count existing active tokens for this centre on that date
    const activeTokensCount = await prisma.token.count({
      where: {
        centreId,
        slotDate,
        status: { in: ['BOOKED', 'CALLED', 'IN_PROGRESS'] },
      },
    });

    const queuePosition = activeTokensCount + 1;
    // Calculate estimated wait time based on 12 minutes per trolley standard
    const estimatedWaitMinutes = queuePosition * 12;

    let tokenNumber;
    let isUnique = false;
    while (!isUnique) {
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      tokenNumber = `KK-${new Date().getFullYear()}-${randomSuffix}`;
      const existing = await prisma.token.findUnique({ where: { tokenNumber } });
      if (!existing) isUnique = true;
    }

    const token = await prisma.token.create({
      data: {
        tokenNumber,
        farmerId,
        centreId,
        cropType,
        estimatedWeight: parseFloat(estimatedWeight),
        vehicleNumber: vehicleNumber || 'N/A',
        slotDate,
        slotTime,
        queuePosition,
        estimatedWaitMinutes,
        status: 'BOOKED',
      },
      include: {
        centre: true,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Slot booked successfully! Digital token issued.',
      token,
    });
  } catch (error) {
    console.error('Book token error:', error);
    res.status(500).json({ success: false, message: 'Failed to book slot', error: error.message });
  }
};

export const getMyTokens = async (req, res) => {
  try {
    const farmerId = req.user.id;
    const tokens = await prisma.token.findMany({
      where: { farmerId },
      include: {
        centre: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Helper for formatting clock time (e.g. "11:45 AM")
    const formatEta = (mins) => {
      const date = new Date(Date.now() + mins * 60000);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    // Find all distinct active centres for this farmer's tokens
    const activeCentreIds = [
      ...new Set(
        tokens
          .filter((t) => ['BOOKED', 'CALLED', 'IN_PROGRESS'].includes(t.status))
          .map((t) => t.centreId)
      ),
    ];

    // Fetch live active queue for each relevant centre to calculate real-time dynamic wait times
    const centreQueues = {};
    for (const cId of activeCentreIds) {
      centreQueues[cId] = await prisma.token.findMany({
        where: {
          centreId: cId,
          status: { in: ['IN_PROGRESS', 'CALLED', 'BOOKED'] },
        },
        orderBy: { createdAt: 'asc' },
      });
    }

    // Recalculate dynamic live queue metrics for each token
    const enhancedTokens = tokens.map((token) => {
      if (token.status === 'COMPLETED' || token.status === 'CANCELLED') {
        return {
          ...token,
          queuePosition: 0,
          estimatedWaitMinutes: 0,
          estimatedClearanceTime: token.status === 'COMPLETED' ? 'Completed' : 'Cancelled',
          aheadCount: 0,
          isNextInLine: false,
        };
      }

      const centreTokens = centreQueues[token.centreId] || [];
      const inProgressToken = centreTokens.find((t) => t.status === 'IN_PROGRESS');
      const calledTokens = centreTokens.filter((t) => t.status === 'CALLED');
      const capacityPerHour = token.centre?.capacityPerHour || 5;
      const minPerVehicle = Math.max(8, Math.round(60 / capacityPerHour)); // 10-12 mins

      if (token.status === 'IN_PROGRESS') {
        return {
          ...token,
          queuePosition: 1,
          estimatedWaitMinutes: 0,
          estimatedClearanceTime: 'Active on Weighbridge Now',
          aheadCount: 0,
          isNextInLine: true,
        };
      }

      if (token.status === 'CALLED') {
        const calledIdx = calledTokens.findIndex((t) => t.id === token.id);
        const wait = Math.max(1, (calledIdx === -1 ? 0 : calledIdx) * 3 + 2);
        return {
          ...token,
          queuePosition: 1,
          estimatedWaitMinutes: wait,
          estimatedClearanceTime: `${formatEta(wait)} (At Gate)`,
          aheadCount: calledIdx === -1 ? 0 : calledIdx,
          isNextInLine: true,
        };
      }

      if (token.status === 'BOOKED') {
        const bookedTokens = centreTokens.filter((t) => t.status === 'BOOKED');
        const bookedIdx = bookedTokens.findIndex((t) => t.id === token.id);
        const aheadCount = (inProgressToken ? 1 : 0) + calledTokens.length + (bookedIdx === -1 ? 0 : bookedIdx);

        // If no active vehicles ahead, this vehicle is next in line to enter!
        if (aheadCount === 0) {
          const wait = 4;
          return {
            ...token,
            queuePosition: 1,
            estimatedWaitMinutes: wait,
            estimatedClearanceTime: `${formatEta(wait)} (Next to Enter)`,
            aheadCount: 0,
            isNextInLine: true,
          };
        }

        // Dynamic wait time factoring in gate calls, in-progress vehicle, and queue position
        const wait = (calledTokens.length * 4) + (inProgressToken ? 6 : 0) + ((bookedIdx === -1 ? 0 : bookedIdx) * minPerVehicle);
        const dynamicWait = Math.max(4, wait);

        return {
          ...token,
          queuePosition: aheadCount + 1,
          estimatedWaitMinutes: dynamicWait,
          estimatedClearanceTime: formatEta(dynamicWait),
          aheadCount,
          isNextInLine: false,
        };
      }

      return token;
    });

    res.json({ success: true, tokens: enhancedTokens });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch tokens', error: error.message });
  }
};

export const getTokenDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const token = await prisma.token.findUnique({
      where: { id },
      include: {
        centre: true,
        farmer: {
          select: { id: true, name: true, phone: true, village: true },
        },
      },
    });

    if (!token) {
      return res.status(404).json({ success: false, message: 'Token not found' });
    }

    res.json({ success: true, token });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch token', error: error.message });
  }
};

export const updateTokenStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, actualWeight, moistureLevel, rejectionReason } = req.body;

    const validStatuses = ['BOOKED', 'CALLED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const updatedToken = await prisma.token.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(actualWeight !== undefined && { actualWeight: parseFloat(actualWeight) }),
        ...(moistureLevel !== undefined && { moistureLevel: parseFloat(moistureLevel) }),
        ...(rejectionReason !== undefined && { rejectionReason }),
      },
      include: {
        centre: true,
        farmer: {
          select: { id: true, name: true, phone: true },
        },
      },
    });

    res.json({
      success: true,
      message: `Token status updated to ${status}`,
      token: updatedToken,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update token status', error: error.message });
  }
};

export const cancelToken = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const role = req.user.role;

    const token = await prisma.token.findUnique({
      where: { id },
    });

    if (!token) {
      return res.status(404).json({ success: false, message: 'Token not found' });
    }

    if (role === 'FARMER' && token.farmerId !== userId) {
      return res.status(403).json({ success: false, message: 'Not authorized to cancel this token' });
    }

    if (token.status === 'COMPLETED') {
      return res.status(400).json({ success: false, message: 'Completed tokens cannot be cancelled' });
    }

    const updatedToken = await prisma.token.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        rejectionReason: req.body?.reason || 'Cancelled by farmer',
      },
      include: {
        centre: true,
      },
    });

    res.json({
      success: true,
      message: 'Token cancelled successfully',
      token: updatedToken,
    });
  } catch (error) {
    console.error('Cancel token error:', error);
    res.status(500).json({ success: false, message: 'Failed to cancel token', error: error.message });
  }
};

export const getAnalytics = async (req, res) => {
  try {
    const [totalTokens, completedTokens, activeTokens, cancelledTokens, tokensList] = await Promise.all([
      prisma.token.count(),
      prisma.token.count({ where: { status: 'COMPLETED' } }),
      prisma.token.count({ where: { status: { in: ['BOOKED', 'CALLED', 'IN_PROGRESS'] } } }),
      prisma.token.count({ where: { status: 'CANCELLED' } }),
      prisma.token.findMany({
        select: {
          cropType: true,
          estimatedWeight: true,
          actualWeight: true,
          status: true,
          createdAt: true,
        },
      }),
    ]);

    let totalWeightQuintals = 0;
    let completedWeightQuintals = 0;
    const cropCountMap = {};

    tokensList.forEach((t) => {
      const weight = t.actualWeight || t.estimatedWeight || 0;
      totalWeightQuintals += weight;
      if (t.status === 'COMPLETED') {
        completedWeightQuintals += weight;
      }
      cropCountMap[t.cropType] = (cropCountMap[t.cropType] || 0) + 1;
    });

    const totalMSPDisbursedAmount = completedWeightQuintals * 2275;
    const totalMSPDisbursedFormatted =
      totalMSPDisbursedAmount >= 10000000
        ? `₹${(totalMSPDisbursedAmount / 10000000).toFixed(2)} Cr`
        : `₹${(totalMSPDisbursedAmount / 100000).toFixed(2)} Lakh`;

    res.json({
      success: true,
      analytics: {
        totalTokens,
        completedTokens,
        activeTokens,
        cancelledTokens,
        totalWeightQuintals: Math.round(totalWeightQuintals),
        completedWeightQuintals: Math.round(completedWeightQuintals),
        totalMSPDisbursed: totalMSPDisbursedFormatted,
        cropBreakdown: cropCountMap,
      },
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ success: false, message: 'Failed to compute analytics', error: error.message });
  }
};

export const getSlotAvailability = async (req, res) => {
  try {
    const { centreId, date } = req.query;

    if (!centreId) {
      return res.status(400).json({ success: false, message: 'centreId is required' });
    }

    const slotDate = date || new Date().toISOString().split('T')[0];

    const centre = await prisma.centre.findUnique({
      where: { id: centreId },
    });

    if (!centre) {
      return res.status(404).json({ success: false, message: 'Centre not found' });
    }

    const capacityPerHour = centre.capacityPerHour || 6;

    const standardSlots = [
      '08:00 AM - 09:00 AM',
      '09:00 AM - 10:00 AM',
      '10:00 AM - 11:00 AM',
      '11:00 AM - 12:00 PM',
      '12:00 PM - 01:00 PM',
      '02:00 PM - 03:00 PM',
      '03:00 PM - 04:00 PM',
      '04:00 PM - 05:00 PM',
    ];

    const activeTokens = await prisma.token.findMany({
      where: {
        centreId,
        slotDate,
        status: { in: ['BOOKED', 'CALLED', 'IN_PROGRESS'] },
      },
      select: {
        slotTime: true,
      },
    });

    const slotCounts = {};
    activeTokens.forEach((t) => {
      slotCounts[t.slotTime] = (slotCounts[t.slotTime] || 0) + 1;
    });

    let recommendedSlot = null;

    const slots = standardSlots.map((slot) => {
      const booked = slotCounts[slot] || 0;
      const available = Math.max(0, capacityPerHour - booked);
      let status = 'AVAILABLE';
      if (available === 0) {
        status = 'FULL';
      } else if (available <= 2) {
        status = 'FAST_FILLING';
      }

      if (!recommendedSlot && available > 0) {
        recommendedSlot = slot;
      }

      return {
        slotTime: slot,
        capacity: capacityPerHour,
        booked,
        available,
        status,
      };
    });

    res.json({
      success: true,
      centreId,
      centreName: centre.name,
      slotDate,
      capacityPerHour,
      recommendedSlot: recommendedSlot || standardSlots[0],
      slots,
    });
  } catch (error) {
    console.error('Slot availability error:', error);
    res.status(500).json({ success: false, message: 'Failed to compute slot availability', error: error.message });
  }
};

export const getCropStockDetails = async (req, res) => {
  try {
    const tokens = await prisma.token.findMany({
      select: {
        cropType: true,
        estimatedWeight: true,
        actualWeight: true,
        status: true,
        createdAt: true,
      },
    });

    const cropsMaster = [
      {
        id: 'wheat',
        name: 'Wheat (Sharbati / Common)',
        shortName: 'Wheat / Gehun',
        image: '/crops/wheat.jpg',
        mspPerQuintal: 2275,
        season: 'Rabi Harvest',
        siloCapacityQuintals: 30000,
        baseStock: 14200,
        maxMoisture: '12.0%',
        qualityGrade: 'Grade A (FAQ Compliant)',
        description: 'Certified wheat procurement with digital grain assaying and moisture sensors.',
      },
      {
        id: 'paddy',
        name: 'Paddy (Basmati / Common)',
        shortName: 'Paddy / Basmati Dhan',
        image: '/crops/paddy.jpg',
        mspPerQuintal: 2300,
        season: 'Kharif Harvest',
        siloCapacityQuintals: 25000,
        baseStock: 11800,
        maxMoisture: '14.0%',
        qualityGrade: 'Grade A Long Grain',
        description: 'Premium aromatic basmati and common paddy intake with covered unloading sheds.',
      },
      {
        id: 'mustard',
        name: 'Mustard / Rapeseed',
        shortName: 'Mustard / Sarson',
        image: '/crops/mustard.jpg',
        mspPerQuintal: 5650,
        season: 'Rabi Harvest',
        siloCapacityQuintals: 15000,
        baseStock: 6450,
        maxMoisture: '8.0%',
        qualityGrade: 'High Oil Content (42%+)',
        description: 'Yellow and black mustard oilseed stock with automatic oil-content verification.',
      },
      {
        id: 'chana',
        name: 'Gram / Chickpea',
        shortName: 'Gram / Desi Chana',
        image: '/crops/chana.jpg',
        mspPerQuintal: 5440,
        season: 'Rabi Harvest',
        siloCapacityQuintals: 12000,
        baseStock: 5200,
        maxMoisture: '10.0%',
        qualityGrade: 'FAQ Standard Pulses',
        description: 'Nutritious pulse procurement directly supported by NAFED price stabilization.',
      },
      {
        id: 'maize',
        name: 'Maize / Corn',
        shortName: 'Maize / Makka',
        image: '/crops/maize.jpg',
        mspPerQuintal: 2090,
        season: 'Kharif Harvest',
        siloCapacityQuintals: 20000,
        baseStock: 8900,
        maxMoisture: '14.0%',
        qualityGrade: 'Yellow Feed/Industrial Grade',
        description: 'High-energy golden grain stored in aerated steel silos with temperature monitors.',
      },
      {
        id: 'soybean',
        name: 'Soybean',
        shortName: 'Soybean / Soya',
        image: '/crops/soybean.jpg',
        mspPerQuintal: 4600,
        season: 'Kharif Harvest',
        siloCapacityQuintals: 16000,
        baseStock: 7100,
        maxMoisture: '10.0%',
        qualityGrade: 'High Protein Yellow Soya',
        description: 'Premium oilseed and protein crop with automated dockage and moisture testing.',
      },
      {
        id: 'cotton',
        name: 'Cotton (Medium / Long Staple)',
        shortName: 'Cotton / Kapas',
        image: '/crops/cotton.jpg',
        mspPerQuintal: 6620,
        season: 'Kharif Harvest',
        siloCapacityQuintals: 14000,
        baseStock: 5800,
        maxMoisture: '8.5%',
        qualityGrade: 'White Long Staple',
        description: 'CCI certified white cotton bolls stored in moisture-proof ventilated warehouses.',
      },
    ];

    const todayStr = new Date().toISOString().split('T')[0];

    const cropStocks = cropsMaster.map((crop) => {
      const matchingTokens = tokens.filter((t) =>
        (t.cropType || '').toLowerCase().includes(crop.id) ||
        crop.name.toLowerCase().includes((t.cropType || '').toLowerCase()) ||
        (t.cropType || '').toLowerCase().includes(crop.shortName.toLowerCase().split('/')[0].trim())
      );

      const completedWeight = matchingTokens
        .filter((t) => t.status === 'COMPLETED')
        .reduce((sum, t) => sum + (t.actualWeight || t.estimatedWeight || 0), 0);

      const activeWeight = matchingTokens
        .filter((t) => ['BOOKED', 'CALLED', 'IN_PROGRESS'].includes(t.status))
        .reduce((sum, t) => sum + (t.estimatedWeight || 0), 0);

      const todayArrivalsWeight = matchingTokens
        .filter((t) => t.createdAt && t.createdAt.toISOString().startsWith(todayStr))
        .reduce((sum, t) => sum + (t.actualWeight || t.estimatedWeight || 0), 0);

      const totalCurrentStock = crop.baseStock + Math.round(completedWeight);
      const occupancyPct = Math.min(100, Math.round((totalCurrentStock / crop.siloCapacityQuintals) * 100));
      const availableCapacity = Math.max(0, crop.siloCapacityQuintals - totalCurrentStock);

      let storageStatus = 'OPTIMAL';
      if (occupancyPct >= 85) storageStatus = 'NEAR_CAPACITY';
      else if (occupancyPct >= 65) storageStatus = 'MODERATE';

      return {
        ...crop,
        currentStockQuintals: totalCurrentStock,
        availableCapacityQuintals: availableCapacity,
        occupancyPercentage: occupancyPct,
        activeIncomingTrolleys: matchingTokens.filter((t) => ['BOOKED', 'CALLED', 'IN_PROGRESS'].includes(t.status)).length,
        activeIncomingQuintals: Math.round(activeWeight),
        todayArrivalsQuintals: Math.round(todayArrivalsWeight),
        storageStatus,
      };
    });

    const totalYardCapacity = cropStocks.reduce((sum, c) => sum + c.siloCapacityQuintals, 0);
    const totalYardStock = cropStocks.reduce((sum, c) => sum + c.currentStockQuintals, 0);

    res.json({
      success: true,
      summary: {
        totalCropsSupported: cropStocks.length,
        totalYardCapacityQuintals: totalYardCapacity,
        totalYardStockQuintals: totalYardStock,
        overallYardOccupancyPercentage: Math.round((totalYardStock / totalYardCapacity) * 100),
      },
      crops: cropStocks,
    });
  } catch (error) {
    console.error('Crop stock error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch crop stock details', error: error.message });
  }
};



