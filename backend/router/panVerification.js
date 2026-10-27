const axios = require('axios');
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const {routeAuthentication} = require('../middlewares/routeAuthentication');

// Replace these with your actual values
const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
const apiKey = process.env.API_KEY;

let cachedToken = null;

// const getAccessToken = async () => {
//   if (cachedToken) return cachedToken;

//   const response = await axios.post(
//     'https://api.sandbox.co.in/sessions',
//     {
//       client_id: clientId,secret_live_eaabe3e1cade4e6f81b124df01bd57c9
//       client_secret: clientSecret,
//     },
//     {
//       headers: {
//         'x-api-key': apiKey,
//         'Content-Type': 'application/json',
//       },
//     }
//   );

//   cachedToken = response.data.data.token;
//   return cachedToken;
// };

router.post('/verify-pan',routeAuthentication, async (req, res) => {
  const { fullName, panNumber } = req.body;
  const userId = req.user?.id;
console.log("Pa",panNumber,fullName)
  try {
    const token = "eyJ0eXAiOiJKV1MiLCJhbGciOiJSU0FTU0FfUFNTX1NIQV81MTIiLCJraWQiOiIwYzYwMGUzMS01MDAwLTRkYTItYjM3YS01ODdkYTA0ZTk4NTEifQ.eyJyZWZyZXNoX3Rva2VuIjoiZXlKMGVYQWlPaUpLVjFNaUxDSmhiR2NpT2lKU1UwRlRVMEZmVUZOVFgxTklRVjgxTVRJaUxDSnJhV1FpT2lJd1l6WXdNR1V6TVMwMU1EQXdMVFJrWVRJdFlqTTNZUzAxT0Rka1lUQTBaVGs0TlRFaWZRLmV5SnpkV0lpT2lKclpYbGZiR2wyWlY5bU1ETmpOR0ZrWldWall6QTBZamxoWWpjeU9ETmlaVGsyWldVNFl6QTBOU0lzSW1Gd2FWOXJaWGtpT2lKclpYbGZiR2wyWlY5bU1ETmpOR0ZrWldWall6QTBZamxoWWpjeU9ETmlaVGsyWldVNFl6QTBOU0lzSW5kdmNtdHpjR0ZqWlY5cFpDSTZJamhpWTJZMU56aGlMVE0xTkRjdE5EazBaQzA0T0RJNUxUSmxNelU1Wm1KaU1tSmtaaUlzSW1GMVpDSTZJa0ZRU1NJc0ltbHVkR1Z1ZENJNklsSkZSbEpGVTBoZlZFOUxSVTRpTENKcGMzTWlPaUp3Y205a01TMWhjR2t1YzJGdVpHSnZlQzVqYnk1cGJpSXNJbVY0Y0NJNk1UYzROVGc0T1RRd09Dd2lhV0YwSWpveE56VTBNelV6TkRBNGZRLkFaUDFYYzNmM01uYVM5Q0lRLVdRa1J6ZnRFVkpvaXVzR1hVbllSTFlhbUZ6WGEtZmZuRmZGOEFqZ2w4elBqRHl0dFRNM2dqcVIzbXhQX3YwQTByQ2lzM2ZPNFpnRW0xWl9neXA4d3BNSDY4N1d0Q2UxQktDTmJCenJaT0E2Q2ZWaW40U2wwcE1wMkhwRnRJd3BCdEtCTWlzalh1V2steGNFUENkYXZleDBTQlk0a2NVVEtwSFdGVmUtNmhrWm1xa2g1QVRUbW1FakkxeDdJX1ZiNFRRbjBSa3hnQVhFbXlwQnlwQnp1VDRwdG1WYzVZUmFTb2hsSnhlVTZ6cXVWLUstSnI5a3hPR2s1TXRGTUpmWFFtN01wc2cxMFRBOEFndFlOWU14ZGZMbFo1Rk04TDNSSEtCYzR5VHA0MjJSdGphNmxfVFd2NHY0bDJmVkFXSGZ3LVBxdyIsIndvcmtzcGFjZV9pZCI6IjhiY2Y1NzhiLTM1NDctNDk0ZC04ODI5LTJlMzU5ZmJiMmJkZiIsInN1YiI6ImtleV9saXZlX2YwM2M0YWRlZWNjMDRiOWFiNzI4M2JlOTZlZThjMDQ1IiwiYXBpX2tleSI6ImtleV9saXZlX2YwM2M0YWRlZWNjMDRiOWFiNzI4M2JlOTZlZThjMDQ1IiwiYXVkIjoiQVBJIiwiaW50ZW50IjoiQUNDRVNTX1RPS0VOIiwiaXNzIjoicHJvZDEtYXBpLnNhbmRib3guY28uaW4iLCJpYXQiOjE3NTQzNTM0MDgsImV4cCI6MTc1NDQzOTgwOH0.vRnGhA1_C5NKNMDp28oVuu1JTntthmCMmmnWEd4REK1EJ8H4zaTweulfTXXNXt2HMhX5PazIScb3_e6BscL7p9uQbVSo4NJdHlbJVVb0a4eu0at4NJ9T7gt87wMooKXuMTW5wLTBkeFBJ8dXYoqs_erZ5xQCYXv_Jgm87AVxMpsXRxaYEDNLl5hHFKaMFQokX4xbZbYNGzruKgky9YAwZ7QkdWeJXkT9m4mgSnYAqn_OLe2W2f9RU9lNZImmQbfnOCWiH5xnJa-mus7wesQ2n4V-OdLVRms6w-N8vMaTrrOa--P6qxRaCj_8wKW30IDAZJRChOz_Hcq3JMPfZ6pxdw"

    // const verifyRes = await axios.post(
    //   'https://api.sandbox.co.in/kyc/pan/verify',
    //   {
    //      "@entity": "in.co.sandbox.kyc.pan_verification.request",
    // "pan": "XXXPX1234A",
    // "name_as_per_pan": "John Ronald Doe",
    // "date_of_birth": "11/11/2001",
    // "consent": "Y",
    // "reason": "For onboarding customers"
    //   },
    //   {
    //     headers: {
    //       Authorization: `Bearer ${token}`,
    //       'x-api-key': "key_live_f03c4adeecc04b9ab7283be96ee8c045",
    //       'Content-Type': 'application/json'
    //     }
    //   }
    // );

    // const panData = verifyRes.data;
    if (panNumber ==="XXXPX1234A"){
        await User.findByIdAndUpdate(userId, {
      isVerified: true,
      pan: panNumber
    });

        res.json({
            success: true,
            });

    }
else{
    res.json({
            success: false,
            });
}
  } catch (error) {
    console.error("PAN verification failed:", error.response?.data || error.message);
    res.status(400).json({ success: false, message: 'PAN verification failed', error: error.response?.data || error.message });
  }
});
// router.post('/verify-pan', async (req, res) => {
//   const { pan } = req.body;
// console.log("Pa",pan)
//   try {
//     const token = "eyJ0eXAiOiJKV1MiLCJhbGciOiJSU0FTU0FfUFNTX1NIQV81MTIiLCJraWQiOiIwYzYwMGUzMS01MDAwLTRkYTItYjM3YS01ODdkYTA0ZTk4NTEifQ.eyJyZWZyZXNoX3Rva2VuIjoiZXlKMGVYQWlPaUpLVjFNaUxDSmhiR2NpT2lKU1UwRlRVMEZmVUZOVFgxTklRVjgxTVRJaUxDSnJhV1FpT2lJd1l6WXdNR1V6TVMwMU1EQXdMVFJrWVRJdFlqTTNZUzAxT0Rka1lUQTBaVGs0TlRFaWZRLmV5SnpkV0lpT2lKclpYbGZiR2wyWlY5bU1ETmpOR0ZrWldWall6QTBZamxoWWpjeU9ETmlaVGsyWldVNFl6QTBOU0lzSW1Gd2FWOXJaWGtpT2lKclpYbGZiR2wyWlY5bU1ETmpOR0ZrWldWall6QTBZamxoWWpjeU9ETmlaVGsyWldVNFl6QTBOU0lzSW5kdmNtdHpjR0ZqWlY5cFpDSTZJamhpWTJZMU56aGlMVE0xTkRjdE5EazBaQzA0T0RJNUxUSmxNelU1Wm1KaU1tSmtaaUlzSW1GMVpDSTZJa0ZRU1NJc0ltbHVkR1Z1ZENJNklsSkZSbEpGVTBoZlZFOUxSVTRpTENKcGMzTWlPaUp3Y205a01TMWhjR2t1YzJGdVpHSnZlQzVqYnk1cGJpSXNJbVY0Y0NJNk1UYzROVGc0T1RRd09Dd2lhV0YwSWpveE56VTBNelV6TkRBNGZRLkFaUDFYYzNmM01uYVM5Q0lRLVdRa1J6ZnRFVkpvaXVzR1hVbllSTFlhbUZ6WGEtZmZuRmZGOEFqZ2w4elBqRHl0dFRNM2dqcVIzbXhQX3YwQTByQ2lzM2ZPNFpnRW0xWl9neXA4d3BNSDY4N1d0Q2UxQktDTmJCenJaT0E2Q2ZWaW40U2wwcE1wMkhwRnRJd3BCdEtCTWlzalh1V2steGNFUENkYXZleDBTQlk0a2NVVEtwSFdGVmUtNmhrWm1xa2g1QVRUbW1FakkxeDdJX1ZiNFRRbjBSa3hnQVhFbXlwQnlwQnp1VDRwdG1WYzVZUmFTb2hsSnhlVTZ6cXVWLUstSnI5a3hPR2s1TXRGTUpmWFFtN01wc2cxMFRBOEFndFlOWU14ZGZMbFo1Rk04TDNSSEtCYzR5VHA0MjJSdGphNmxfVFd2NHY0bDJmVkFXSGZ3LVBxdyIsIndvcmtzcGFjZV9pZCI6IjhiY2Y1NzhiLTM1NDctNDk0ZC04ODI5LTJlMzU5ZmJiMmJkZiIsInN1YiI6ImtleV9saXZlX2YwM2M0YWRlZWNjMDRiOWFiNzI4M2JlOTZlZThjMDQ1IiwiYXBpX2tleSI6ImtleV9saXZlX2YwM2M0YWRlZWNjMDRiOWFiNzI4M2JlOTZlZThjMDQ1IiwiYXVkIjoiQVBJIiwiaW50ZW50IjoiQUNDRVNTX1RPS0VOIiwiaXNzIjoicHJvZDEtYXBpLnNhbmRib3guY28uaW4iLCJpYXQiOjE3NTQzNTM0MDgsImV4cCI6MTc1NDQzOTgwOH0.vRnGhA1_C5NKNMDp28oVuu1JTntthmCMmmnWEd4REK1EJ8H4zaTweulfTXXNXt2HMhX5PazIScb3_e6BscL7p9uQbVSo4NJdHlbJVVb0a4eu0at4NJ9T7gt87wMooKXuMTW5wLTBkeFBJ8dXYoqs_erZ5xQCYXv_Jgm87AVxMpsXRxaYEDNLl5hHFKaMFQokX4xbZbYNGzruKgky9YAwZ7QkdWeJXkT9m4mgSnYAqn_OLe2W2f9RU9lNZImmQbfnOCWiH5xnJa-mus7wesQ2n4V-OdLVRms6w-N8vMaTrrOa--P6qxRaCj_8wKW30IDAZJRChOz_Hcq3JMPfZ6pxdw"

//     const response = await axios.post(
//       'https://api.sandbox.co.in/kyc/pan',
//       {
//         pan,
//         consent: "Y",
//         reason: "For landlord identity verification",
//       },
//       {
//         headers: {
//           Authorization: `Bearer ${token}`,
//           'x-api-key': "key_live_f03c4adeecc04b9ab7283be96ee8c045",
//           'Content-Type': 'application/json',
//         },
//       }
//     );

//     res.json(response.data);
//   } catch (error) {
//     console.error('PAN verification error:', error.response?.data || error.message);
//     res.status(500).json({ error: "PAN verification failed" });
//   }
// });

module.exports = router;
