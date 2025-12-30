/**
 * Mock Data for DTU Timetable Scheduler
 * Structure refined for easy manual entry (Skeleton)
 */

const BRANCHES = [
    'Bio-Technology (BT)',
    'Chemical Engineering (CHE)',
    'Civil Engineering (CE)',
    'Computer Science and Engineering (CSE)',
    'Computer Science and Engineering (Data Science) (CSDA)',
    'Electronics and Communication Engineering (ECE)',
    'Electronics Engineering (VLSI) (EVDT)',
    'Electrical Engineering (EE)',
    'Environmental Engineering (ENE)',
    'Engineering Physics (EP)',
    'Information Technology (IT)',
    'Information Technology (Cyber Security) (ITCY)',
    'Mathematics and Computing (MCE)',
    'Mechanical Engineering (ME)',
    'Mechanical Engineering (Auto) (MAM)',
    'Production and Industrial Engineering (PIE)',
    'Software Engineering (SE)'
];

const SECTIONS = {
    'BT': [1],
    'CHE': [1],
    'CE': [1, 2],
    'CSE': [1, 2, 3, 4, 5, 6],
    'CSDA': [1],
    'ECE': [1, 2, 3],
    'EE': [1, 2, 3, 4, 5],
    'EVDT': [1],
    'ENE': [1],
    'EP': [1, 2],
    'IT': [1, 2],
    'ITCY': [1],
    'MCE': [1, 2, 3],
    'ME': [1, 2, 3, 4],
    'MAM': [1],
    'PIE': [1],
    'SE': [1, 2, 3],
    'default': [1, 2]
};

const UNIVERSITY_INFO = {
    name: "Delhi Technological University (DTU)",
    formerly: "Delhi College of Engineering (DCE)",
    established: 1941,
    address: "Shahbad Daulatpur, Main Bawana Road, Delhi, 110042",
    contact: {
        general: "011-27871018",
        hostel: "Check specific hostel office",
        security: "Available 24/7 at main gate"
    },
    landmarks: [
        { name: "SPS (Smart Lecture Hall Complex)", description: "Contains SPS-1 to SPS-13. Major venue for lectures and orientation." },
        { name: "Pragyan Bhawan (PB)", description: "Academic hub containing the Computer Center, IT, CSE, and core departments." },
        { name: "Central Library", description: "Three-story building with over 2 lakh books and digital resources." },
        { name: "OAT (Open Air Theatre)", description: "Venue for cultural fests (Engifest) and major events." },
        { name: "Admin Block", description: "Main administrative office, Registar office, and Academic section." },
        { name: "Sports Complex", description: "Facilities for cricket, football, running track, and indoor games." }
    ],
    mess_timings: {
        breakfast: "7:30 AM - 9:00 AM",
        lunch: "12:30 PM - 2:00 PM",
        snacks: "5:00 PM - 6:00 PM",
        dinner: "7:30 PM - 9:00 PM"
    },
    resources: [
        { name: "Official Website", url: "www.dtu.ac.in" },
        { name: "Exam Portal", url: "exam.dtu.ac.in" },
        { name: "LMS", url: "lms.dtu.ac.in" }
    ]
};

const TIME_SLOTS = [
    '8-9', '9-10', '10-11', '11-12', '12-1', '1-2', '2-3', '3-4', '4-5', '5-6'
];

/**
 * TIMETABLE SKELETON
 * Format: Branch -> Semester -> Section -> Day -> TimeSlot
 * Use this structure to feed your data.
 */
const TIMETABLE_SKELETON = {
    'CSE': {
        '2': { // 2nd Semester
            '1': { // Section 1
                'Monday': {
                    '9-10': { code: 'CS104', subject: 'Data Structures (L)', venue: 'PB-GF4', professor: 'Dr. Vineet Kumar' },
                    '10-11': { code: 'AM102', subject: 'Mathematics-II (L)', venue: 'PB-GF4', professor: 'Math Faculty' },
                    '11-12': { code: 'AM102', subject: 'Mathematics-II (T)', venue: 'AB3', professor: 'Math Faculty' }, // Tutorial group 1
                    '3-4': { code: 'CS102', subject: 'Discrete Structure (L)', venue: 'SPS6', professor: 'Dr. Faculty' },
                    '4-5': { code: 'CS104', subject: 'Data Structures (Lab)', venue: 'Lab', professor: 'Dr. Vineet Kumar' },
                    '5-6': { code: 'CS104', subject: 'Data Structures (Lab)', venue: 'Lab', professor: 'Dr. Vineet Kumar' }
                },
                'Tuesday': {
                    '8-9': { code: 'AEC/VAC', subject: 'AEC/VAC', venue: '', professor: '' },
                    '10-11': { code: 'AP102', subject: 'Physics (L)', venue: 'PB-GF4', professor: 'Physics Faculty' },
                    '11-12': { code: 'AM102', subject: 'Mathematics-II (T)', venue: 'AB-3', professor: 'Math Faculty' },
                    '2-3': { code: 'CS102', subject: 'Discrete Structure (L+T)', venue: 'PB-GF4', professor: 'Faculty' }
                },
                'Wednesday': {
                    '10-11': { code: 'SEC-1', subject: 'Basics of ML (CS-106)', venue: 'AB-4', professor: 'Faculty' },
                    '11-12': { code: 'CS104', subject: 'Data Structures (L)', venue: 'PB-GF4', professor: 'Dr. Vineet Kumar' },
                    '2-3': { code: 'AP102', subject: 'Physics (Lab)', venue: 'Lab', professor: 'Physics Faculty' }
                },
                'Thursday': {
                    '8-9': { code: 'AEC/VAC', subject: 'AEC/VAC', venue: '', professor: '' },
                    '9-10': { code: 'CS102', subject: 'Discrete Structure (L)', venue: 'PB-GF4', professor: 'Faculty' }
                },
                'Friday': {
                    '8-9': { code: 'AM102', subject: 'Mathematics-II (L)', venue: 'PB-GF4', professor: 'Math Faculty' },
                    '9-10': { code: 'AP102', subject: 'Physics (L)', venue: 'PB-GF4', professor: 'Physics Faculty' }
                }
            }
        }
    },
    'EE': {
        '2': {
             '1': {
                 'Monday': {
                     '12-1': { code: 'EE104', subject: 'Circuit Theory (Lab)', venue: 'PB-GF6', professor: 'Faculty' },
                     '2-3': { code: 'AP102', subject: 'Physics (L)', venue: 'PB-GF6', professor: 'Dr. Neha' },
                     '3-4': { code: 'AM102', subject: 'Mathematics-II (L)', venue: 'PB-GF6', professor: 'Math Faculty' }
                 }
             }
        }
    }
};

// Seed Data
const MOCK_DB = {
    users: [
        { id: 'admin', role: 'admin', name: 'Admin', email: 'admin@dtu.ac.in', password: 'admin' },
        { id: 'demo123', role: 'student', name: 'Demo Student', email: 'student@dtu.ac.in', password: 'pass', branch: 'CSE', section: '1', semester: '2' },
        { id: '2K25/CSE/01', role: 'student', name: 'John Doe', email: 'john@dtu.ac.in', password: 'pass', branch: 'CSE', section: '1', semester: '2' },
        { id: 'W001', role: 'warden_hostel', name: 'Demo Warden', email: 'warden@dtu.ac.in', password: 'pass', hostel: 'Aryabhatta' },
        { id: 'P001', role: 'professor', name: 'Dr. Vineet Kumar', email: 'prof@dtu.ac.in', password: 'pass', dept: 'CSE' }
    ],
    // "classes" array will be generated dynamically from TIMETABLE_SKELETON for backward compatibility/ease of use in app logic
    classes: [], 
    notices: [
        { id: 1, type: 'hostel', title: 'Water Supply Maintenance', content: 'No water from 2-4 PM today.', date: '2025-12-29' }
    ]
};

// LocalStorage Helper
const DB = {
    init: () => {
        // Always reconstruct classes from Skeleton to ensure updates are reflected
        MOCK_DB.classes = DB.generateFlatClasses();
        
        let storedData = JSON.parse(localStorage.getItem('dtu_data_v2'));
        
        if (!storedData) {
             localStorage.setItem('dtu_data_v2', JSON.stringify(MOCK_DB));
        } else {
            // SYNC FIX: Ensure demo users exist even if LS has old data
            ['demo123', 'P001', 'W001'].forEach(uid => { // Sync Student, Prof & Warden
                const user = MOCK_DB.users.find(u => u.id === uid);
                if(user) {
                    // Remove old version if exists (to update email/pass)
                    const existingIdx = storedData.users.findIndex(u => u.id === uid);
                    if(existingIdx !== -1) storedData.users.splice(existingIdx, 1);
                    
                    storedData.users.push(user);
                }
            });
            localStorage.setItem('dtu_data_v2', JSON.stringify(storedData));
            
            // Also force update classes from Skeleton in case we changed them
            // BUT preserve status (cancellations)
            if (storedData.classes && storedData.classes.length > 0) {
                 MOCK_DB.classes = MOCK_DB.classes.map(freshClass => {
                     const existing = storedData.classes.find(c => c.id === freshClass.id);
                     if (existing && existing.status) {
                         freshClass.status = existing.status;
                     }
                     return freshClass;
                 });
            }
            storedData.classes = MOCK_DB.classes;
             localStorage.setItem('dtu_data_v2', JSON.stringify(storedData));
        }
    },
    
    // Helper to flatten the skeleton into the array format used by dashboards
    generateFlatClasses: () => {
        const flatList = [];
        let idCounter = 1;

        for (const [branch, sems] of Object.entries(TIMETABLE_SKELETON)) {
            for (const [sem, sections] of Object.entries(sems)) {
                for (const [section, days] of Object.entries(sections)) {
                    for (const [day, slots] of Object.entries(days)) {
                        for (const [time, classInfo] of Object.entries(slots)) {
                            if(classInfo) {
                                flatList.push({
                                    id: idCounter++,
                                    branch,
                                    semester: sem,
                                    section,
                                    day,
                                    time: time, // e.g. "9-10"
                                    rawTime: parseInt(time.split('-')[0]), // for sorting
                                    ...classInfo,
                                    status: 'upcoming'
                                });
                            }
                        }
                    }
                }
            }
        }
        return flatList;
    },

    get: () => {
        // We merged skeleton into DB, so we prioritize the stored data but if we want to ensure Skeleton updates apply, we might re-merge. 
        // For simplicity: read from LS.
        return JSON.parse(localStorage.getItem('dtu_data_v2')) || MOCK_DB;
    },
    
    update: (data) => localStorage.setItem('dtu_data_v2', JSON.stringify(data)),
    
    findUser: (email, password) => {
        const db = DB.get();
        return db.users.find(u => u.email === email && u.password === password);
    },
    
    registerUser: (user) => {
        const db = DB.get();
        if (db.users.find(u => u.email === user.email)) return { error: 'Email already exists' };
        db.users.push(user);
        DB.update(db);
        return { success: true };
    },

    updateUser: (email, updates) => {
        const db = DB.get();
        const userIdx = db.users.findIndex(u => u.email === email);
        if (userIdx > -1) {
            // If "updates" is a string, assume it's a password (backward compatibility)
            if (typeof updates === 'string') {
                 db.users[userIdx].password = updates;
            } else {
                 // Object merge for profile updates
                 db.users[userIdx] = { ...db.users[userIdx], ...updates };
            }
            DB.update(db);
            return { success: true, user: db.users[userIdx] };
        }
        return { success: false, message: 'User not found' };
    }
};

DB.init();
