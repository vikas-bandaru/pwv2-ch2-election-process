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
                    }
                    voterData.campaignIndex++;
                    if (voterData.campaignIndex >= 3) {
                        voterData.state = States.POLL;
                    }
                }
                break;

            case States.POLL:
                if (action === 'VOTE') {
                    voterData.candidateChoice = data.candidateChoice || 'A';
                    // User only successfully votes if they have ID and are NOT scammed
                    voterData.voted = voterData.hasID && !voterData.isScammed;
                    voterData.state = States.COUNTING;
                }
                break;

            default:
                break;
        }
    }

    /**
     * Butterfly Effect Calculation
     * Outcome: Result = (Simulation_Result) + (user_vote ? 1 : 0)
     */
    calculateResults() {
        const voterData = this.session.voterData;
        const simulationResult = 1000; // Base votes for opponent
        const userVoteValue = voterData.voted ? 1 : 0;
        
        const candidateVotes = 1000 + userVoteValue;
        const opponentVotes = 1001; // Opponent always has 1001 to ensure margin of 1

        // If user voted, candidate has 1001, Opponent 1001? 
        // No, user wants Winning Margin exactly 1.
        // If 'VOTED', user's candidate wins. (Candidate 1001, Opponent 1000)
        // If 'INELIGIBLE' or 'SCAMMED', candidate loses by 1. (Candidate 1000, Opponent 1001)

        let finalCandidateVotes, finalOpponentVotes;
        
        if (voterData.voted) {
            finalCandidateVotes = 1001;
            finalOpponentVotes = 1000;
        } else {
            finalCandidateVotes = 1000;
            finalOpponentVotes = 1001;
        }

        return {
            winner: voterData.voted ? 'Your Candidate' : 'Opponent',
            margin: 1,
            votes: { candidate: finalCandidateVotes, opponent: finalOpponentVotes },
            voted: voterData.voted,
            isScammed: voterData.isScammed,
            hasID: voterData.hasID,
            message: voterData.voted 
                ? "Every single vote counts. You were the difference." 
                : (voterData.isScammed 
                    ? "Misinformation stole your voice. You were scammed into staying home." 
                    : "A single vote could have changed everything. Your ID was your key, and you lost it.")
        };
    }
}

module.exports = { CivicStateMachine, States };

