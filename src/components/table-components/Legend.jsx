const Legend = () => (
  <div className="flex flex-wrap gap-4 justify-center mt-4 text-sm">
    <div className="flex items-center gap-2">
      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
      <span>Champions League</span>
    </div>
    <div className="flex items-center gap-2">
      <div className="w-3 h-3 rounded-full bg-green-500"></div>
      <span>Europa League</span>
    </div>
    <div className="flex items-center gap-2">
      <div className="w-3 h-3 rounded-full bg-orange-500"></div>
      <span>Conference League</span>
    </div>
    <div className="flex items-center gap-2">
      <div className="w-3 h-3 rounded-full bg-red-500"></div>
      <span>Relegation Zone</span>
    </div>
  </div>
);

export default Legend; 