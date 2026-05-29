require('dotenv').config();
const { connectDB } = require('./config/db');
const User = require('./models/User');
const Event = require('./models/Event');
const Community = require('./models/Community');
const Project = require('./models/Project');

const faker = require('faker');

const seed = async () => {
  await connectDB();
  // clean
  await User.deleteMany({});
  await Event.deleteMany({});
  await Community.deleteMany({});
  await Project.deleteMany({});

  const skills = ['JavaScript', 'React', 'Node.js', 'Python', 'Django', 'MongoDB', 'CSS', 'HTML', 'Go', 'Rust'];

  const users = [];
  for (let i = 0; i < 10; i++) {
    const name = faker.name.findName();
    const email = `user${i}@example.com`;
    const password = 'password123';
    const u = await User.create({ name, email, password, skillsKnown: [skills[i % skills.length]], skillsWanted: [skills[(i+1) % skills.length]] });
    users.push(u);
  }

  for (let i = 0; i < 3; i++) {
    await Event.create({ title: `Challenge ${i+1}`, problemStatement: `Solve problem ${i+1}`, bounty: (i+1)*100, maxParticipants: 5, createdBy: users[i % users.length]._id });
  }

  for (let i = 0; i < 3; i++) {
    await Community.create({ name: `Community-${i+1}`, description: `A community about ${skills[i]}`, tags: [skills[i]] , creator: users[i]._id, members: [users[i]._id], memberCount: 1 });
  }

  for (let i = 0; i < 5; i++) {
    await Project.create({ seller: users[i]._id, title: `Project ${i+1}`, description: 'A demo project', techStack: [skills[i%skills.length]], price: (i+1)*500 });
  }

  console.log('Seeding complete');
  process.exit(0);
};

seed().catch(err => { console.error(err); process.exit(1); });
