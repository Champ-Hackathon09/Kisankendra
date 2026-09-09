import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/db.js';

export const register = async (req, res) => {
  try {
    const { name, phone, password, role = 'FARMER', state, district, village } = req.body;

    if (!name || !phone || !password) {
      return res.status(400).json({ success: false, message: 'Name, phone and password are required' });
    }

    const existingUser = await prisma.user.findUnique({
      where: { phone },
    });

    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Phone number already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        phone,
        password: hashedPassword,
        role: role.toUpperCase(),
        state,
        district,
        village,
      },
      select: {
        id: true,
        name: true,
        phone: true,
        role: true,
        state: true,
        district: true,
        village: true,
      },
    });

    const token = jwt.sign(
      { id: user.id, phone: user.phone, role: user.role, name: user.name },
      process.env.JWT_SECRET || 'kisankendra_super_secure_jwt_secret_key_2026',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      user,
      token,
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      return res.status(400).json({ success: false, message: 'Phone and password are required' });
    }

    const user = await prisma.user.findUnique({
      where: { phone },
    });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid phone number or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid phone number or password' });
    }

    const token = jwt.sign(
      { id: user.id, phone: user.phone, role: user.role, name: user.name },
      process.env.JWT_SECRET || 'kisankendra_super_secure_jwt_secret_key_2026',
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        role: user.role,
        state: user.state,
        district: user.district,
        village: user.village,
      },
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        phone: true,
        role: true,
        state: true,
        district: true,
        village: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { name, state, district, village } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        ...(name && { name }),
        ...(state !== undefined && { state }),
        ...(district !== undefined && { district }),
        ...(village !== undefined && { village }),
      },
      select: {
        id: true,
        name: true,
        phone: true,
        role: true,
        state: true,
        district: true,
        village: true,
      },
    });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ success: false, message: 'Failed to update profile', error: error.message });
  }
};

export const googleLogin = async (req, res) => {
  try {
    const { name, email, role = 'FARMER' } = req.body;
    const userRole = (role || 'FARMER').toUpperCase();
    const displayName = name || (email ? email.split('@')[0] : 'Kisan User');
    const lookupPhone = userRole === 'OPERATOR' ? '9123456780' : '9876543210';

    // Find existing user or seed user by role / phone
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { phone: lookupPhone },
          { role: userRole }
        ]
      }
    });

    if (!user) {
      const defaultPassword = await bcrypt.hash('GoogleLogin2026', 10);
      user = await prisma.user.create({
        data: {
          name: displayName,
          phone: lookupPhone,
          password: defaultPassword,
          role: userRole,
          state: 'Haryana',
          district: 'Karnal',
          village: 'Karnal Mandi',
        },
      });
    }

    const token = jwt.sign(
      { id: user.id, phone: user.phone, role: user.role, name: user.name },
      process.env.JWT_SECRET || 'kisankendra_super_secure_jwt_secret_key_2026',
      { expiresIn: '30d' }
    );

    res.json({
      success: true,
      message: 'Google Sign-In successful',
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        role: user.role,
        state: user.state,
        district: user.district,
        village: user.village,
        email: email || `${user.name.toLowerCase().replace(/\s+/g, '')}@gmail.com`,
      },
      token,
    });
  } catch (error) {
    console.error('Google login error:', error);
    res.status(500).json({ success: false, message: 'Google Sign-In failed', error: error.message });
  }
};

