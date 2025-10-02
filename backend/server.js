// Create new donation - ENHANCED DEBUG
app.post('/api/donations', (req, res) => {
  console.log('CREATING NEW DONATION');
  console.log('Request Body:', req.body);
  console.log('DonorId from request:', req.body.donorId);
  console.log('User ID type:', typeof req.body.donorId);
  
  const donation = { 
    id: Date.now(), 
    ...req.body, 
    status: 'available',
    createdAt: new Date().toISOString()
  };
  
  donations.push(donation);
  
  console.log('DONATION CREATED SUCCESSFULLY');
  console.log('Final donation object:', donation);
  console.log('Total donations now:', donations.length);
  
  io.emit('newDonation', donation);
  
  res.json(donation);
});
app.get('/api/users/:userId/donations', (req, res) => {
  console.log('FETCHING USER DONATIONS');
  console.log('Requested User ID:', req.params.userId);
  console.log('User ID type:', typeof req.params.userId);
  console.log('All donations:', donations);
  
  const userDonations = donations.filter(d => {
    const match = d.donorId == req.params.userId;
    console.log(`Checking: Donation ${d.id} | DonorId: ${d.donorId} | Requested: ${req.params.userId} | Match: ${match}`);
    return match;
  });
  
  console.log('USER DONATIONS RESULT');
  console.log('Found:', userDonations.length, 'donations');
  console.log('Donations:', userDonations);
  
  res.json(userDonations);
});