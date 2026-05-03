/**
 * CivicLogic State Machine
 * States: ANNOUNCEMENT, PREP, CAMPAIGN, POLL, COUNTING
 */

const States = {
    ANNOUNCEMENT: 'ANNOUNCEMENT',
    PREP: 'PREP',
    CAMPAIGN: 'CAMPAIGN',
    POLL: 'POLL',
    COUNTING: 'COUNTING'
};

/**
 * Transition logic and voter status updates
 */
class CivicStateMachine {
    constructor(session) {
        this.session = session;
        if (!this.session.voterData) {
            this.session.voterData = {
                state: States.ANNOUNCEMENT,
                hasID: false,
                isScammed: false,
                isRegistered: false,
                candidateChoice: null,
                voted: false,
                simulationDate: null, // User selected date
                campaignIndex: 0,     // Progress through multiple news items
                scamHeadline: null,   // The specific fake news that misled the voter
                maliciousCandidateId: null, // Candidate linked to a scam
                role: 'VOTER',        // VOTER, CANDIDATE, or OFFICER
                location: {
                    constituency: null,
                    state: null,
                    pinCode: null
                }
            };
        }
    }

    getData() {
        return this.session.voterData;
    }

    /**
     * Move to the next stage based on user actions
     * @param {string} action - The action taken by the user
     * @param {object} data - Additional data for the action
     */
    transition(action, data = {}) {
        const voterData = this.session.voterData;

        switch (voterData.state) {
            case States.ANNOUNCEMENT:
                if (action === 'SET_LOCATION') {
                    voterData.location = {
                        constituency: data.constituency,
                        state: data.state,
                        pinCode: data.pinCode
                    };
                    voterData.simulationDate = data.simulationDate || voterData.simulationDate;
                } else if (action === 'PROCEED' || action === 'START_PREP') {
                    voterData.state = States.PREP;
                }
                break;

            case States.PREP:
                if (action === 'PROVIDE_ID') {
                    voterData.hasID = !!data.hasID;
                    voterData.state = States.CAMPAIGN;
                } else if (action === 'REGISTER_FORM_6') {
                    voterData.isRegistered = true;
                }
                break;

            case States.CAMPAIGN:
                if (action === 'NEXT_NEWS') {
                    if (data.isScammed && !voterData.isScammed) {
                        voterData.isScammed = true;
                        voterData.scamHeadline = data.scamHeadline;
                        if (data.isMalicious === 'true') {
                            voterData.misledByCandidate = true;
                        }
                    }
                    voterData.campaignIndex++;
                    if (voterData.campaignIndex >= 3) {
                        voterData.state = States.POLL;
                    }
                }
                break;

            case States.POLL:
                if (action === 'VOTE') {
                    voterData.candidateChoice = data.candidateChoice;
                    // Allow voting if scammed by candidate lie, but block for general scams
                    voterData.voted = voterData.hasID && (!voterData.isScammed || voterData.misledByCandidate);
                    voterData.state = States.COUNTING;
                }
                break;

            default:
                break;
        }
    }

    /**
     * Butterfly Effect Calculation
     * Outcome: Result is calculated such that the chosen candidate wins or loses by EXACTLY 1 vote.
     */
    calculateResults() {
        const voterData = this.session.voterData;
        const electionData = require('./electionData.json');
        const candidates = electionData.candidates;
        
        // Find the candidate the user researched/voted for (default to 'A' if none)
        const chosenId = voterData.candidateChoice || 'A';
        const chosenCandidate = candidates.find(c => c.id === chosenId);

        // Simulate base votes for all candidates
        // We want the winner to have X votes and runner-up to have X-1
        const baseVotes = 1250; 
        
        let resultsList = candidates.map(c => {
            // Randomish but stable base votes
            let votes = baseVotes - (Math.floor(Math.random() * 200)); 
            return { ...c, votes };
        });

        // Sort by votes descending to find current leaders
        resultsList.sort((a, b) => b.votes - a.votes);

        // Now adjust for the Butterfly Effect
        if (voterData.voted) {
            // USER VOTED: Their candidate must win by 1 vote against the current leader
            const topCompetitor = resultsList.find(c => c.id !== chosenId);
            const winnerVotes = topCompetitor.votes + 1;
            
            resultsList.forEach(c => {
                if (c.id === chosenId) c.votes = winnerVotes;
            });
        } else {
            // USER DID NOT VOTE: Their candidate must lose by 1 vote to the current leader
            // If the chosen candidate was already leading, we make someone else lead by 1
            const topCompetitor = resultsList.find(c => c.id !== chosenId);
            const winnerVotes = topCompetitor.votes;
            
            resultsList.forEach(c => {
                if (c.id === chosenId) c.votes = winnerVotes - 1;
                // Ensure top competitor is exactly 1 ahead
                if (c.id === topCompetitor.id) c.votes = winnerVotes;
            });
        }

        // Re-sort final list
        resultsList.sort((a, b) => b.votes - a.votes);
        const winner = resultsList[0];

        // Special Verdict for Misinformation Loop (Fate Frozen)
        let specialVerdict = null;
        if (voterData.misledByCandidate && voterData.candidateChoice === voterData.maliciousCandidateId && voterData.voted) {
            const malCand = resultsList.find(c => c.id === voterData.maliciousCandidateId);
            specialVerdict = {
                title: "⚠️ Research Failure: Fate Frozen",
                message: `You were misled by fake news linked to ${malCand.name} (${malCand.party}) and ultimately chose them as your representative. Because your decision was based on misinformation rather than research, your civic impact has been compromised. You are now tied to this representative's actions until the next cycle of elections.`
            };
        }

        return {
            constituency: voterData.location.constituency || 'Your Constituency',
            winner: winner,
            chosenCandidate: chosenCandidate,
            margin: 1,
            candidates: resultsList,
            voted: voterData.voted,
            isScammed: voterData.isScammed,
            hasID: voterData.hasID,
            specialVerdict: specialVerdict,
            message: voterData.voted 
                ? `In ${voterData.location.constituency}, every single vote counted. You were the difference that brought ${chosenCandidate.name} to victory.` 
                : (voterData.isScammed 
                    ? `Misinformation stole your voice. ${chosenCandidate.name} lost by just one vote—the vote you didn't cast because of a lie.` 
                    : `Identity is power. Because you couldn't verify your ID, ${chosenCandidate.name} fell short by a single vote. Democracy missed you today.`)
        };
    }
}

module.exports = { CivicStateMachine, States };
