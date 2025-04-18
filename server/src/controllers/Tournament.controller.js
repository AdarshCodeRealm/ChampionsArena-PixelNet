import Tournament from '../models/Tournament.model.js';

const getTournamentById = async (req, res) => {
  try {
    const tournamentId = req.params.id;
    
    if (!tournamentId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Tournament ID is required' 
      });
    }

    const tournament = await Tournament.findById(tournamentId);
    
    if (!tournament) {
      return res.status(404).json({ 
        success: false, 
        message: 'Tournament not found' 
      });
    }

    return res.status(200).json({
      success: true,
      data: tournament
    });
  } catch (error) {
    console.error('Error fetching tournament:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};


const getAllTournaments = async (req, res) => {
  try {
    const tournaments = [{
        id:1,
        name:"Free Fire Summer Championship ",
        organizer:"Andhera Arena",
        game:"Free Fire MAX",
        prize:"$1,000",
        date:"June 15, 2023",
        registeredTeams:28,
        maxTeams:32,
        status:"upcoming",
        bannerImage:"https://i.pinimg.com/474x/a6/ee/c4/a6eec4a2cd7d3afcd9a9dfd9f87dc533.jpg",
    },
    {
        id:2,
        name:"world Championship ",
        organizer:"Andhera Arena",
        game:"Free Fire MAX",
        prize:"$1,000",
        date:"June 15, 2023",
        registeredTeams:28,
        maxTeams:32,
        status:"upcoming",
        bannerImage:"https://i.pinimg.com/474x/a6/ee/c4/a6eec4a2cd7d3afcd9a9dfd9f87dc533.jpg",
    }];
    
    return res.status(200).json({
      success: true,
      count: tournaments.length,
      data: tournaments
    });
  } catch (error) {
    console.error('Error fetching tournaments:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

export {getTournamentById,getAllTournaments};

