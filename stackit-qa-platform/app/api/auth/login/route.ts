// API route for user authentication
// This will be ready when MongoDB integration is complete

import { NextRequest, NextResponse } from 'next/server'
// import { UserService, validateUserData } from '@/lib/services/user-service'
// import bcrypt from 'bcryptjs'
// import jwt from 'jsonwebtoken'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    /* When MongoDB is ready, uncomment this implementation:
    
    // Find user by email
    const user = await UserService.getUserByEmail(email)
    
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Check if user is active and not banned
    if (!user.isActive || user.isBanned) {
      return NextResponse.json(
        { error: 'Account is inactive or banned' },
        { status: 403 }
      )
    }

    // Verify password (you'll need to store hashed passwords)
    const isValidPassword = await bcrypt.compare(password, user.hashedPassword)
    
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Update last login
    await UserService.updateLastLogin(user.id)

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        role: user.role,
        username: user.username 
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    )

    // Return user data and token
    return NextResponse.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        isBanned: user.isBanned
      },
      token
    })
    
    */

    // Mock response for development
    console.log(`Login attempt for: ${email}`)
    
    return NextResponse.json({
      message: 'MongoDB login endpoint ready. Implement when database is connected.',
      mockUser: {
        id: '1',
        username: 'test_user',
        email: email,
        role: email.includes('admin') ? 'admin' : 'user'
      }
    })

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
