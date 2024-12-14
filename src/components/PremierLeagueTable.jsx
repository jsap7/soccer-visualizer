import { useState, useEffect } from 'react';
import { TEXT_SIZES, FONT_WEIGHTS, COLORS } from './table-components/constants';
import FormIndicator from './table-components/FormIndicator';
import TeamCell from './table-components/TeamCell';
import MatchCell from './table-components/MatchCell';
import Legend from './table-components/Legend';
import TableHeader from './table-components/TableHeader';
import { fetchTableData } from '../services/premierLeagueService';

const PremierLeagueTable = () => {
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setError(null);
        setLoading(true);
        const data = await fetchTableData();
        
        if (!data) {
          throw new Error('No table data received');
        }
        
        setTableData(data);
      } catch (err) {
        console.error('Error loading table:', err);
        setError(err.message || 'Failed to load table data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-500 mb-3"></div>
      <h2 className={`${TEXT_SIZES.lg} ${FONT_WEIGHTS.semibold} text-gray-700 mb-2`}>Loading Premier League Table</h2>
    </div>
  );

  if (error) return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gray-50">
      <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded relative max-w-md text-sm">
        <strong className={FONT_WEIGHTS.bold}>Error: </strong>
        <span className="block sm:inline">{error}</span>
      </div>
    </div>
  );

  const getPositionIndicator = (position) => {
    if (position <= 4) return COLORS.champions;
    if (position === 5) return COLORS.europa;
    if (position === 6) return COLORS.conference;
    if (position >= 18) return COLORS.relegation;
    return '';
  };

  return (
    <div className="container mx-auto px-4 py-4">
      <h1 className={`${TEXT_SIZES['2xl']} ${FONT_WEIGHTS.bold} text-center mb-6`}>Premier League Table</h1>
      <div className="flex justify-center">
        <div className="overflow-x-auto rounded-lg shadow">
          <table className={`bg-white ${TEXT_SIZES.sm} border-collapse relative`}>
            <TableHeader />
            <tbody className="text-gray-700">
              {tableData.map((team, index) => {
                const position = index + 1;
                const goalDiff = team.goalsFor - team.goalsAgainst;
                const goalDiffColor = goalDiff > 0 ? 'text-green-600' : 
                                    goalDiff < 0 ? 'text-red-600' : '';
                
                return (
                  <tr key={team.team.id} className="hover:bg-gray-50 border-b">
                    <td className={`px-4 py-3 text-center border-r ${COLORS.divider} relative before:absolute before:top-0 before:left-0 before:w-1 before:h-[calc(100%+1px)] ${getPositionIndicator(position)}`}>
                      {position}
                    </td>
                    <td className="px-4 py-3 border-r ${COLORS.divider}">
                      <TeamCell team={team.team} />
                    </td>
                    <td className="px-4 py-3 text-center border-r ${COLORS.divider}">{team.playedGames}</td>
                    <td className="px-4 py-3 text-center border-r ${COLORS.divider}">{team.won}</td>
                    <td className="px-4 py-3 text-center border-r ${COLORS.divider}">{team.draw}</td>
                    <td className="px-4 py-3 text-center border-r ${COLORS.divider}">{team.lost}</td>
                    <td className="px-4 py-3 text-center border-r ${COLORS.divider}">{team.goalsFor}</td>
                    <td className="px-4 py-3 text-center border-r ${COLORS.divider}">{team.goalsAgainst}</td>
                    <td className={`px-4 py-3 text-center border-r ${COLORS.divider} ${goalDiffColor} font-medium`}>{goalDiff}</td>
                    <td className={`px-4 py-3 text-center ${FONT_WEIGHTS.bold} border-r ${COLORS.divider}`}>{team.points}</td>
                    <td className="px-4 py-3 border-r ${COLORS.divider}">
                      <FormIndicator 
                        form={team.form}
                        formMatches={team.formMatches}
                        teamId={team.team.id}
                        position={position}
                      />
                    </td>
                    <td className="px-4 py-3 border-r ${COLORS.divider}">
                      <MatchCell match={team.lastMatch} teamId={team.team.id} type="last" />
                    </td>
                    <td className="px-4 py-3">
                      <MatchCell match={team.nextMatch} teamId={team.team.id} type="next" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      <Legend />
    </div>
  );
};

export default PremierLeagueTable; 