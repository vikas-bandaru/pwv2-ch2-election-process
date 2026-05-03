const express = require('express');
const router = express.Router();
const { CivicStateMachine, States } = require('../logic/stateMachine');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'MOCK_KEY');

router.get('/test', (req, res) => res.send('ok'));

// ── Shared candidate data (used in PREP research + POLL EVM) ─────────────────
function getCandidateData() {
    return [
        { id: 'A', name: 'Lydan',  nickname: 'The Well-Builder',  symbol: '🪣', party: 'Jal Shakti Party',
          promise: 'Clean water for every house in 2 years.',
          form26: { assets: '₹4 lakh — one house, some gold.', liabilities: '₹1.5 lakh bank loan.', cases: 'None.', education: 'Class 10 pass.' } },
        { id: 'B', name: 'Syrin',  nickname: 'The Skill-Teacher', symbol: '📚', party: 'Kaushal Vikas Dal',
          promise: 'Free skill school for all village youth.',
          form26: { assets: '₹12 lakh — land and savings.', liabilities: 'No loans.', cases: '1 old case — traffic fine. Settled.', education: 'Graduate.' } },
        { id: 'C', name: 'Ptorik', nickname: 'The Road-Fixer',    symbol: '🛣️', party: 'Sadak Sudhar Manch',
          promise: 'Fix all broken roads in 6 months.',
          form26: { assets: '₹88 lakh — business and property.', liabilities: '₹30 lakh business loan.', cases: '2 cases — both still in court.', education: 'MBA.' } },
        { id: 'D', name: 'Vaxen',  nickname: 'The Health Worker', symbol: '🏥', party: 'Swasthya Seva Party',
          promise: 'Free health check-up camp every month.',
          form26: { assets: '₹6 lakh — house and savings.', liabilities: 'No loans.', cases: 'None.', education: 'Nursing diploma.' } },
        { id: 'E', name: 'Krylo',  nickname: 'The Law-Maker',     symbol: '⚖️', party: 'Niyam Rakshak Dal',
          promise: 'Make a new law to stop farm fires.',
          form26: { assets: '₹2.3 crore — flats and gold.', liabilities: '₹60 lakh loans.', cases: '5 cases — still going on.', education: 'Law degree.' } }
    ];
}
function getForm26Analogies() {
    return {
        assets:      { label: 'Property & Gold',   tip: 'Things they own — house, land, gold, money in bank.' },
        liabilities: { label: 'Bank Loans',         tip: 'Money they still owe to others.' },
        cases:       { label: 'Police Cases',        tip: 'Times police or court said they did something wrong.' },
        education:   { label: 'School / College',   tip: 'How much they studied in school.' }
    };
}


router.get('/', async (req, res) => {
    if (!req.session.voterName) return res.redirect('/auth/login');

    const sm = new CivicStateMachine(req.session);
    const voterData = sm.getData();
    
    // If we've reached the counting phase, redirect to results
    if (voterData.state === States.COUNTING) {
        return res.redirect('/results');
    }

    const budget = req.getBudgetStatus();


    let extraData = {};

    // State-specific data fetching
    if (voterData.state === States.ANNOUNCEMENT && voterData.location.state) {
        // Load Election Data for Timeline
        const electionData = require('../logic/electionData.json');
        const pollDates = electionData.pollDates;
        const pollDayStr = pollDates[voterData.location.state] || '2026-05-15';
        const pollDay = new Date(pollDayStr);
        
        const todayStr = voterData.simulationDate || electionData.simulationToday;

        // Compute the 3 key phase milestone dates for the state
        const announcementDay = new Date(electionData.announcementDate); // T-45 ish
        const enrollmentDay = new Date(pollDay); enrollmentDay.setDate(enrollmentDay.getDate() - 15); // T-15
        const campDay = new Date(pollDay); campDay.setDate(campDay.getDate() - 7); // T-7, campaign heat

        const fmtDate = (d) => d.toISOString().split('T')[0]; // yyyy-mm-dd for form value
        const fmtLabel = (d) => d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

        extraData.electionTimeline = {
            pollDate: fmtLabel(pollDay),
            daysToPoll: Math.ceil((pollDay - new Date(todayStr)) / (1000 * 60 * 60 * 24))
        };

        // Timeline news cards (state-specific dates)
        extraData.newsPhases = [
            {
                type: 'newspaper',
                source: 'The Civic Times',
                date: fmtLabel(announcementDay),
                isoDate: fmtDate(announcementDay),
                headline: `ECI Blows Poll Bugle: ${voterData.location.state} Assembly Elections Officially Announced`,
                body: `The Election Commission of India has notified poll dates for ${voterData.location.state}. The Model Code of Conduct kicks in immediately. New voter registrations are now open.`,
                phase: '📢 Phase 1: Announcement'
            },
            {
                type: 'mobile',
                source: 'Voter Helpline App',
                date: fmtLabel(enrollmentDay),
                isoDate: fmtDate(enrollmentDay),
                headline: `LAST CHANCE: Voter Roll Update Closes ${fmtLabel(enrollmentDay)}!`,
                body: `Check your name on the Electoral Roll. Submit Form 6 if you are not yet registered. EPIC downloads available on the Voter Helpline App.`,
                phase: '📋 Phase 2: Preparation'
            },
            {
                type: 'website',
                source: 'eci.gov.in',
                date: fmtLabel(campDay),
                isoDate: fmtDate(campDay),
                headline: `7 Days to ${voterData.location.state} Polls — Campaign Enters Final Lap`,
                body: `Security forces deployed. Polling parties dispatched to remote constituencies. Know your booth and carry your EPIC card. Stay alert against misinformation.`,
                phase: '🗳️ Phase 3: Campaign & Poll'
            }
        ];

        if (req.trackApiUsage('GEMINI')) {
            try {
                const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
                const prompt = `Generate a realistic and exciting news headline and a short summary (2 sentences) about the upcoming 2026 Assembly Elections in ${voterData.location.state}, India. Mention that the election is scheduled for ${extraData.electionTimeline.pollDate}. Focus on the announcement being made in Q1 2026. Format: { headline: '...', summary: '...' }`;
                const result = await model.generateContent(prompt);
                const response = await result.response;
                const text = response.text();
                const cleanText = text.replace(/```json|```/g, '').trim();
                extraData.electionAnnouncement = JSON.parse(cleanText);
            } catch (e) {
                console.error("Gemini Error:", e);
                extraData.electionAnnouncement = { 
                    headline: `Election Commission announces poll dates for ${voterData.location.state}!`, 
                    summary: `The democratic battle begins in ${voterData.location.state} as the ECI releases the much-awaited schedule for ${extraData.electionTimeline.pollDate}. Citizens are urged to verify their voter IDs.` 
                };
            }
        }
    } else if (voterData.state === States.PREP) {
        const electionData = require('../logic/electionData.json');
        const pollDates = electionData.pollDates;
        const announcementDateStr = electionData.announcementDate;
        const todayStr = voterData.simulationDate || electionData.simulationToday;

        const pollDay = new Date(pollDates[voterData.location.state] || '2026-05-15');
        const today = new Date(todayStr); 

        const addDays = (date, days) => {
            const result = new Date(date);
            result.setDate(result.getDate() + days);
            return result;
        };

        const timeline = {
            announcement: { date: new Date(announcementDateStr), label: 'Official Announcement' },
            enrollment: { date: addDays(pollDay, -15), label: 'Enrollment Deadline (Form 6)' },
            slips: { date: addDays(pollDay, -5), label: 'Voter Slip Distribution' },
            poll: { date: pollDay, label: 'Poll Day' }
        };

        // Determine status for each milestone
        const getStatus = (date) => {
            if (today > date) return 'COMPLETED';
            if (today.toDateString() === date.toDateString()) return 'CURRENT';
            return 'FUTURE';
        };

        extraData.timeline = Object.keys(timeline).map(key => ({
            key,
            label: timeline[key].label,
            date: timeline[key].date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
            status: getStatus(timeline[key].date),
            isPastDeadline: today > timeline.enrollment.date,
            isPastPoll: today > timeline.poll.date
        }));

        extraData.today = today.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
        extraData.isEnrollmentOpen = today <= timeline.enrollment.date;
        extraData.canVote = today <= timeline.poll.date;

        // Candidate data available during PREP (for research) and POLL (for EVM)
        extraData.candidates = getCandidateData();
        extraData.form26Analogies = getForm26Analogies();
    } else if (voterData.state === States.CAMPAIGN) {

        if (req.trackApiUsage('GEMINI')) {
            try {
                const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
                const prompt = `Generate a JSON array of 3 objects for an information war campaign in ${voterData.location.state} elections. 
                Each object must have a 'real' headline and a 'fake' headline. 
                The fake news should feel legitimate but have subtle unrealistic elements.
                Format: [ { real: '...', fake: '...' }, { real: '...', fake: '...' }, { real: '...', fake: '...' } ]`;
                const result = await model.generateContent(prompt);
                const response = await result.response;
                const text = response.text();
                const cleanText = text.replace(/```json|```/g, '').trim();
                const allHeadlines = JSON.parse(cleanText);
                extraData.headlines = allHeadlines[voterData.campaignIndex];
                extraData.newsProgress = voterData.campaignIndex + 1;
            } catch (e) {
                console.error("Gemini Error:", e);
                const fallbacks = [
                    { real: "ECI increases polling hours in Nallagandla.", fake: "Polls to stay open 24 hours for 'convenience'." },
                    { real: "New security measures at sensitive booths.", fake: "Robotic guards to replace police at all polling stations." },
                    { real: "Voter ID mandatory for all citizens.", fake: "Voting now possible via WhatsApp without registration." }
                ];
                extraData.headlines = fallbacks[voterData.campaignIndex];
                extraData.newsProgress = voterData.campaignIndex + 1;
            }
        }
    } else if (voterData.state === States.POLL) {
        const lat = 17.48, lng = 78.34;
        const apiKey = process.env.GOOGLE_MAPS_API_KEY || 'YOUR_API_KEY';
        extraData.mapsUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=15&size=600x300&markers=color:red%7C${lat},${lng}&key=${apiKey}`;
        req.trackApiUsage('MAPS');

        // Use shared helpers — same data shown in PREP research and POLL EVM
        extraData.candidates = getCandidateData();
        extraData.form26Analogies = getForm26Analogies();
    }


    const electionData = require('../logic/electionData.json');

    res.render('simulate', { 
        title: 'Election Simulation',
        state: voterData.state, 
        voterData,
        voterName: req.session.voterName,
        extraData,
        budget,
        electionData
    });
});

router.post('/next-stage', (req, res) => {
    const { action, ...data } = req.body;
    const sm = new CivicStateMachine(req.session);
    
    if (action === 'SET_LOCATION') {
        sm.transition(action, data);
        return res.redirect('/simulate');
    }

    // SET_DATE: update simulationDate only, keep location and state intact
    if (action === 'SET_DATE') {
        const voterData = sm.getData();
        voterData.simulationDate = data.simulationDate;
        return res.redirect('/simulate');
    }

    sm.transition(action, data);
    res.redirect('/simulate');
});

router.get('/location', (req, res) => {
    res.redirect('/simulate');
});

router.get('/reset', (req, res) => {
    delete req.session.voterData;
    res.redirect('/simulate');
});

module.exports = router;


