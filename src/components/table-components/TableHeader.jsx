const COLORS = {
  header: 'bg-[#2f2f2f]'
};

const TableHeader = () => (
  <thead className={`${COLORS.header} text-white`}>
    <tr>
      <th className="px-4 py-3 text-center w-12">#</th>
      <th className="px-4 py-3 text-left w-64">Team</th>
      <th className="px-4 py-3 text-center w-12">MP</th>
      <th className="px-4 py-3 text-center w-12">W</th>
      <th className="px-4 py-3 text-center w-12">D</th>
      <th className="px-4 py-3 text-center w-12">L</th>
      <th className="px-4 py-3 text-center w-12">GF</th>
      <th className="px-4 py-3 text-center w-12">GA</th>
      <th className="px-4 py-3 text-center w-12">GD</th>
      <th className="px-4 py-3 text-center w-12">Pts</th>
      <th className="px-4 py-3 text-center w-40">Form</th>
      <th className="px-4 py-3 text-left w-72">Last Match</th>
      <th className="px-4 py-3 text-left w-64">Next Match</th>
    </tr>
  </thead>
);

export default TableHeader; 