// API route for user registration
// This will be ready when MongoDB integration is complete

import { NextRequest, NextResponse } from 'next/server'
// import { UserService, validateUserData } from '@/lib/services/user-service'
// import bcrypt from 'bcryptjs'
// import jwt from 'jsonwebtoken'

export async function POST(request: NextRequest) {
  try {
    const userData = await request.json()
    const { username, email, password, role } = userData

    // Validate input data
    if (!username || !email || !password) {
      return NextResponse.json(
        { error: 'Username, email, and password are required' },
        { status: 400 }
      )
    }

    /* When MongoDB is ready, uncomment this implementation:
    
    // Validate user data
    const validation = validateUserData(userData)
    if (!validation.isValid) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.errors },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUserByEmail = await UserService.getUserByEmail(email)
    if (existingUserByEmail) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      )
    }

    const existingUserByUsername = await UserService.getUserByUsername(username)
    if (existingUserByUsername) {
      return NextResponse.json(
        { error: 'Username is already taken' },
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    const newUser = await UserService.createUser({
      username,
      email,
      password: hashedPassword,
      role: role || 'user' // Default to user role
    })

    if (!newUser) {
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 500 }
      )
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: newUser.id, 
        role: newUser.role,
        username: newUser.username 
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    )

    // Return user data and token (without password)
    return NextResponse.json({
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
        isActive: newUser.isActive,
        isBanned: newUser.isBanned
      },
      token
    }, { status: 201 })
    
    */

    // Mock response for development
    console.log(`Registration attempt for: ${email}`)
    
    return NextResponse.json({
      message: 'MongoDB registration endpoint ready. Implement when database is connected.',
      mockUser: {
        id: '2',
        username: username,
        email: email,
        role: role || 'user'
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
