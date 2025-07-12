// MongoDB Connection Configuration
// This file will be ready when mongoose is installed

let isConnected = false // Track connection status

export const connectToDatabase = async () => {
  // Prevent multiple connections
  if (isConnected) {
    console.log('MongoDB is already connected')
    return
  }

  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/stackit-qa'
    
    /* When mongoose is available, uncomment this:
    
    await mongoose.connect(mongoUri, {
      // Modern connection options
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    })

    isConnected = true
    console.log('MongoDB connected successfully')
    
    // Handle connection events
    mongoose.connection.on('error', (error) => {
      console.error('MongoDB connection error:', error)
      isConnected = false
    })

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected')
      isConnected = false
    })

    */
    
    // For now, just log that the connection function is ready
    console.log('MongoDB connection function ready. Install mongoose to enable.')
    
  } catch (error) {
    console.error('MongoDB connection failed:', error)
    isConnected = false
    throw error
  }
}

export const disconnectFromDatabase = async () => {
  if (!isConnected) {
    return
  }

  try {
    /* When mongoose is available, uncomment this:
    await mongoose.disconnect()
    */
    isConnected = false
    console.log('MongoDB disconnected successfully')
  } catch (error) {
    console.error('MongoDB disconnection failed:', error)
  }
}
