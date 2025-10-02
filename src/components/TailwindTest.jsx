export default function TailwindTest() {
  return (
    <div className="p-8">
      <div className="bg-red-500 text-white p-4 mb-4 rounded-lg text-center">
        ?? If this is RED, Tailwind is WORKING!
      </div>
      <div className="bg-green-500 text-white p-4 mb-4 rounded-lg text-center">
        ?? If this is GREEN, Tailwind is WORKING!
      </div>
      <div className="bg-blue-500 text-white p-4 rounded-lg text-center">
        ?? If this is BLUE, Tailwind is WORKING!
      </div>
    </div>
  )
}
