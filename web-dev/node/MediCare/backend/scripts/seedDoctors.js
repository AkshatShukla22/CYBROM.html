const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const User = require('../models/User');
const Rating = require('../models/Rating');

const password = 'Doctor@123';

const specialties = [
  'cardiology',
  'dermatology',
  'neurology',
  'pediatrics',
  'orthopedics',
  'psychiatry',
  'general',
  'other'
];

const specialtyMeta = {
  cardiology: {
    title: 'Cardiologist',
    facilities: ['ECG', 'Echocardiography', 'Cardiac risk screening', 'BP monitoring'],
    bios: [
      'Focused on preventive cardiology, hypertension management, and long-term heart health planning.',
      'Experienced in cardiac consultation, lifestyle-led care plans, and post-procedure follow-up.'
    ]
  },
  dermatology: {
    title: 'Dermatologist',
    facilities: ['Skin analysis', 'Acne care', 'Dermatoscopy', 'Cosmetic consultation'],
    bios: [
      'Specializes in acne, pigmentation, eczema, and evidence-based skincare routines.',
      'Provides practical dermatology care for chronic skin conditions and cosmetic concerns.'
    ]
  },
  neurology: {
    title: 'Neurologist',
    facilities: ['Migraine clinic', 'Nerve assessment', 'EEG referral', 'Stroke follow-up'],
    bios: [
      'Works with patients facing migraine, seizure disorders, neuropathy, and movement symptoms.',
      'Known for clear neurological evaluation and patient-friendly treatment explanations.'
    ]
  },
  pediatrics: {
    title: 'Pediatrician',
    facilities: ['Vaccination', 'Growth tracking', 'Newborn care', 'Child nutrition'],
    bios: [
      'Offers child-centered care for newborns, growth milestones, vaccinations, and common infections.',
      'Supports families with preventive pediatric care and practical child health guidance.'
    ]
  },
  orthopedics: {
    title: 'Orthopedic Specialist',
    facilities: ['Joint assessment', 'Fracture care', 'Physio referral', 'Sports injury care'],
    bios: [
      'Treats joint pain, sports injuries, fracture recovery, and musculoskeletal concerns.',
      'Combines orthopedic assessment with rehab-focused recovery planning.'
    ]
  },
  psychiatry: {
    title: 'Psychiatrist',
    facilities: ['Counselling referral', 'Medication review', 'Stress clinic', 'Sleep assessment'],
    bios: [
      'Provides compassionate care for anxiety, depression, sleep problems, and stress disorders.',
      'Focuses on confidential mental health support with structured treatment planning.'
    ]
  },
  general: {
    title: 'General Physician',
    facilities: ['General OPD', 'Preventive checkup', 'Diabetes care', 'Fever clinic'],
    bios: [
      'Handles everyday health concerns, chronic disease reviews, and preventive checkups.',
      'Provides first-line medical care with careful follow-up and referral planning.'
    ]
  },
  other: {
    title: 'Specialist',
    facilities: ['Diagnostic review', 'Follow-up care', 'Preventive screening', 'Health counselling'],
    bios: [
      'Offers specialist consultation with a focus on practical diagnosis and continuity of care.',
      'Helps patients understand symptoms, treatment options, and follow-up plans clearly.'
    ]
  }
};

const names = [
  'Aarav Mehta', 'Ishita Rao', 'Kabir Malhotra', 'Ananya Iyer', 'Vivaan Kapoor',
  'Saanvi Nair', 'Reyansh Sharma', 'Meera Kulkarni', 'Arjun Khanna', 'Diya Menon',
  'Rohan Bansal', 'Kiara Shah', 'Aditya Chaturvedi', 'Nisha Verma', 'Yash Gupta',
  'Tara Joshi', 'Kunal Sethi', 'Avni Desai', 'Devansh Trivedi', 'Riya Saxena',
  'Siddharth Bose', 'Mihika Banerjee', 'Nikhil Reddy', 'Aisha Khan', 'Pranav Pillai',
  'Myra Agarwal', 'Harsh Vardhan', 'Sneha Patil', 'Varun Rao', 'Kavya Mishra',
  'Aman Arora', 'Zara Qureshi', 'Dhruv Jain', 'Lavanya Krishnan', 'Manav Singh',
  'Pooja Sinha', 'Raghav Bhatia', 'Anika Thomas', 'Neel Pandey', 'Shruti Kapoor',
  'Omkar Ghosh', 'Tanvi Chawla', 'Aryan Dutta', 'Jhanvi Mehta', 'Samar Nanda',
  'Esha Roy', 'Krish Mahajan', 'Manya Bedi', 'Parth Suri', 'Sara Fernandes'
];

const cities = [
  ['Mumbai', 'Maharashtra'], ['Delhi', 'Delhi'], ['Bengaluru', 'Karnataka'],
  ['Ahmedabad', 'Gujarat'], ['Bhopal', 'Madhya Pradesh'], ['Pune', 'Maharashtra'],
  ['Hyderabad', 'Telangana'], ['Chennai', 'Tamil Nadu'], ['Kolkata', 'West Bengal'],
  ['Jaipur', 'Rajasthan'], ['Lucknow', 'Uttar Pradesh'], ['Indore', 'Madhya Pradesh']
];

const streets = [
  'Lotus Health Avenue', 'Sunrise Clinic Road', 'Green Park Extension', 'Metro Care Street',
  'Harmony Medical Lane', 'City Wellness Road', 'Silver Oak Colony', 'Prime Health Square'
];

const reviewerNames = [
  'Priya Sharma', 'Rahul Kumar', 'Anita Patel', 'Mohit Jain', 'Neha Singh',
  'Rakesh Yadav', 'Fatima Ali', 'Suresh Menon', 'Alka Gupta', 'Vikram Das',
  'Pallavi Rao', 'Amit Verma', 'Sonia Kapoor', 'Karan Malhotra', 'Meenal Shah'
];

const reviewTexts = [
  'Very clear explanation and a calm approach. I felt listened to throughout the consultation.',
  'The appointment was punctual and the treatment plan was easy to follow.',
  'Good bedside manner, practical advice, and helpful follow-up instructions.',
  'The doctor explained the diagnosis patiently and answered all my questions.',
  'Professional consultation with a clean clinic and friendly staff.',
  'I appreciated the detailed review and realistic medication guidance.',
  'Smooth experience from booking to consultation. Highly recommended.',
  'The doctor was attentive and made the whole visit comfortable.'
];

const slotTemplates = [
  [
    { day: 'monday', startTime: '09:00', endTime: '13:00', isActive: true },
    { day: 'wednesday', startTime: '15:00', endTime: '19:00', isActive: true },
    { day: 'friday', startTime: '10:00', endTime: '14:00', isActive: true }
  ],
  [
    { day: 'tuesday', startTime: '10:00', endTime: '14:00', isActive: true },
    { day: 'thursday', startTime: '16:00', endTime: '20:00', isActive: true },
    { day: 'saturday', startTime: '09:30', endTime: '13:30', isActive: true }
  ],
  [
    { day: 'monday', startTime: '17:00', endTime: '21:00', isActive: true },
    { day: 'tuesday', startTime: '09:00', endTime: '12:30', isActive: true },
    { day: 'saturday', startTime: '11:00', endTime: '15:00', isActive: true }
  ]
];

const seededEmail = (index) => `seed.doctor${String(index + 1).padStart(2, '0')}@medicare.in`;
const seededPatientEmail = (index) => `seed.patient${String(index + 1).padStart(2, '0')}@medicare.in`;

const buildPracticeLocations = (index, specialty) => {
  const cityA = cities[index % cities.length];
  const cityB = cities[(index + 4) % cities.length];
  const baseFee = 350 + (index % 8) * 100;
  const meta = specialtyMeta[specialty];

  return [
    {
      name: `${meta.title} Care ${cityA[0]}`,
      address: {
        street: `${12 + index}, ${streets[index % streets.length]}`,
        city: cityA[0],
        state: cityA[1],
        zipCode: `${400000 + index}`,
        country: 'India'
      },
      consultationFee: baseFee,
      patientsPerDay: 16 + (index % 9),
      availableSlots: slotTemplates[index % slotTemplates.length],
      facilities: meta.facilities,
      isActive: true
    },
    {
      name: `${meta.title} Evening Clinic`,
      address: {
        street: `${28 + index}, ${streets[(index + 3) % streets.length]}`,
        city: cityB[0],
        state: cityB[1],
        zipCode: `${410000 + index}`,
        country: 'India'
      },
      consultationFee: baseFee + 150,
      patientsPerDay: 10 + (index % 6),
      availableSlots: slotTemplates[(index + 1) % slotTemplates.length],
      facilities: meta.facilities.slice(0, 3),
      isActive: true
    }
  ];
};

const upsertUserByEmail = async (data) => {
  const existing = await User.findOne({ email: data.email });

  if (existing) {
    Object.assign(existing, data);
    existing.password = existing.password;
    await existing.save();
    return existing;
  }

  const user = new User({ ...data, password });
  await user.save();
  return user;
};

const ensurePatients = async () => {
  const patients = [];

  for (let i = 0; i < reviewerNames.length; i += 1) {
    const [city, state] = cities[(i + 2) % cities.length];
    const patient = await upsertUserByEmail({
      name: reviewerNames[i],
      email: seededPatientEmail(i),
      phone: `90000${String(50000 + i).padStart(5, '0')}`,
      userType: 'user',
      address: {
        street: `${40 + i}, Patient Residency`,
        city,
        state,
        zipCode: `${420000 + i}`,
        country: 'India'
      },
      contactInfo: {
        phones: [{ number: `90000${String(50000 + i).padStart(5, '0')}`, type: 'primary', isActive: true }],
        emails: [{ email: seededPatientEmail(i), type: 'primary', isActive: true }]
      },
      isVerified: true,
      isActive: true,
      profileImage: `https://i.pravatar.cc/160?img=${20 + i}`
    });

    patients.push(patient);
  }

  return patients;
};

const seed = async () => {
  const mongoUri = process.env.mongo_DB;
  if (!mongoUri) {
    throw new Error('mongo_DB is missing in backend/.env');
  }

  await mongoose.connect(mongoUri);
  console.log('Connected to MongoDB');

  const patients = await ensurePatients();
  let doctorCount = 0;
  let ratingCount = 0;

  for (let i = 0; i < 50; i += 1) {
    const specialty = specialties[i % specialties.length];
    const meta = specialtyMeta[specialty];
    const [city, state] = cities[i % cities.length];
    const averageTarget = 3.8 + ((i * 7) % 13) / 10;
    const reviewsForDoctor = 5 + (i % 6);
    const phone = `88000${String(10000 + i).padStart(5, '0')}`;
    const practiceLocations = buildPracticeLocations(i, specialty);

    const doctor = await upsertUserByEmail({
      name: names[i],
      email: seededEmail(i),
      phone,
      userType: 'doctor',
      specialization: specialty,
      experience: 2 + (i % 23),
      licenseNumber: `MCI-SEED-${String(i + 1).padStart(4, '0')}`,
      consultationFee: practiceLocations[0].consultationFee,
      address: practiceLocations[0].address,
      contactInfo: {
        phones: [
          { number: phone, type: 'primary', isActive: true },
          { number: `99000${String(20000 + i).padStart(5, '0')}`, type: 'secondary', isActive: true }
        ],
        emails: [{ email: seededEmail(i), type: 'primary', isActive: true }]
      },
      practiceLocations,
      availableSlots: practiceLocations[0].availableSlots,
      isVerified: true,
      isActive: true,
      profileImage: `https://i.pravatar.cc/220?img=${(i % 60) + 1}`,
      backgroundImage: `https://images.unsplash.com/photo-1587370560942-ad2a04eabb6d?auto=format&fit=crop&w=1200&q=80&seed=${i}`,
      bio: `${meta.bios[i % meta.bios.length]} Based in ${city}, Dr. ${names[i].split(' ')[0]} has ${2 + (i % 23)} years of clinical experience and offers appointments across ${practiceLocations.map(location => location.address.city).join(' and ')}.`,
      ratings: { average: 0, count: 0 },
      totalAppointments: 40 + (i * 9) % 360
    });

    doctorCount += 1;

    await Rating.deleteMany({ doctorId: doctor._id, userEmail: { $regex: /^seed\.patient/i } });

    const createdRatings = [];
    for (let r = 0; r < reviewsForDoctor; r += 1) {
      const patient = patients[(i + r) % patients.length];
      const rawRating = Math.max(3, Math.min(5, Math.round(averageTarget + ((r % 3) - 1) * 0.35)));
      const rating = await Rating.create({
        doctorId: doctor._id,
        userId: patient._id,
        userName: patient.name,
        userEmail: patient.email,
        profileImage: patient.profileImage,
        rating: rawRating,
        feedback: reviewTexts[(i + r) % reviewTexts.length],
        isActive: true
      });

      createdRatings.push(rating);
      ratingCount += 1;
    }

    const average = createdRatings.reduce((sum, rating) => sum + rating.rating, 0) / createdRatings.length;
    doctor.ratings = {
      average: Math.round(average * 10) / 10,
      count: createdRatings.length
    };
    await doctor.save();
  }

  console.log(`Seeded ${doctorCount} doctors and ${ratingCount} reviews.`);
  await mongoose.disconnect();
};

seed().catch(async (error) => {
  console.error('Doctor seed failed:', error);
  await mongoose.disconnect();
  process.exit(1);
});
