const mongoose = require('mongoose');

const connectDB = async () => {
  let uri = process.env.MONGO_URI || 'mongodb://localhost:27017/skillissue';
  
  try {
    console.log('🔄 Connecting to MongoDB...');
    console.log(`📍 URI: ${uri.replace(/:[^:]*@/, ':****@')}`);
    
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
      retryWrites: true,
      w: 'majority'
    });
    
    console.log('✅ MongoDB connected successfully');
    console.log(`📊 Database: ${mongoose.connection.name}`);
    return true;
  } catch (error) {
    console.error('❌ MongoDB Connection Error:');
    console.error('Error Message:', error.message);
    
    if (error.message.includes('querySrv') || error.message.includes('ECONNREFUSED')) {
      console.error('⚠️  Cannot reach MongoDB Atlas. Checking internet connection...');
      console.error('💡 Attempting fallback to local MongoDB...');
      return attemptLocalConnection();
    } else if (error.message.includes('ENOTFOUND')) {
      console.error('⚠️  Could not resolve host. Check internet connection.');
      console.error('💡 Attempting fallback to local MongoDB...');
      return attemptLocalConnection();
    } else if (error.message.includes('ECONNREFUSED')) {
      console.error('⚠️  Connection refused. Is MongoDB running?');
      console.error('💡 Make sure MongoDB is running locally or check MongoDB Atlas credentials.');
      console.error('💡 Attempting fallback to local MongoDB...');
      return attemptLocalConnection();
    } else if (error.message.includes('authentication failed')) {
      console.error('⚠️  Authentication failed. Check username/password in MongoDB Atlas.');
      console.error('💡 Attempting fallback to local MongoDB...');
      return attemptLocalConnection();
    } else if (error.message.includes('not authorized')) {
      console.error('⚠️  User not authorized. Check database user permissions.');
      console.error('💡 Attempting fallback to local MongoDB...');
      return attemptLocalConnection();
    } else if (error.message.includes('IP address')) {
      console.error('⚠️  IP address not whitelisted. Add your IP to Network Access in MongoDB Atlas.');
      console.error('💡 Attempting fallback to local MongoDB...');
      return attemptLocalConnection();
    }
    
    throw error;
  }
};

const attemptLocalConnection = async () => {
  try {
    console.log('🔄 Trying local MongoDB on localhost:27017...');
    
    await mongoose.connect('mongodb://localhost:27017/skillissue', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 3000,
      connectTimeoutMS: 5000,
    });
    
    console.log('✅ Connected to local MongoDB successfully');
    console.log(`📊 Database: ${mongoose.connection.name}`);
    return true;
  } catch (localError) {
    console.error('❌ Local MongoDB also failed:');
    console.error('Error Message:', localError.message);
    console.error('\n💡 Solutions:');
    console.error('  1. Install MongoDB locally: https://docs.mongodb.com/manual/installation/');
    console.error('  2. Start MongoDB: brew services start mongodb-community');
    console.error('  3. Or fix MongoDB Atlas connection:');
    console.error('     - Check internet connection');
    console.error('     - Verify credentials in .env file');
    console.error('     - Add your IP to MongoDB Atlas Network Access');
    
    throw localError;
  }
};

module.exports = { connectDB };
