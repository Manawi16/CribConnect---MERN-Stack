const router = require('express').Router();
const mongoose = require('mongoose');
const Conversation = require('../models/conversation');
const messageService = require('../services/messageService');
const cookieAuth = require('../middleware/cookieAuth');
const userService = require('../services/userService'); // to verify landlord exists

// GET /api/conversations/:conversationId
router.get('/:conversationId', cookieAuth, async (req, res) => {
  try {
    const { conversationId } = req.params;
    console.log('Fetching conversation with id:', conversationId);

    if (!mongoose.isValidObjectId(conversationId)) {
      return res.status(400).json({ error: 'Invalid conversation id' });
    }

    const convo = await Conversation.findById(conversationId)
      .populate({ path: 'participants', select: 'name email avatar _id' })
      .lean();
    console.log('Fetched conversation:', convo);
    if (!convo) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    // Safe logging
    const parts = Array.isArray(convo.participants) ? convo.participants.filter(Boolean) : [];
    const partsForLog = parts.map(p => (p && p._id ? String(p._id) : '[missing]'));
    console.log('participants:', partsForLog);

    // Compute the "other" participant relative to the authed user
    const meId = req.user && req.user._id ? String(req.user._id) : null;
    const partner = meId
      ? (parts.find(p => p && p._id && String(p._id) !== meId) || null)
      : null;

    return res.json({ data: convo, partner });
  } catch (err) {
    console.error('GET /api/conversations/:conversationId error:', err);
    return res.status(500).json({ error: 'Server error fetching conversation' });
  }
});

// POST /api/conversations/connect
router.post('/connect', cookieAuth, async (req, res) => {
  try {
    const tenantId = String(req.user._id); // from cookieAuth
    const { landlordId, listingContext } = req.body;

    console.log('Connecting tenant', tenantId, 'with landlord', landlordId);

    // Basic checks
    if (!landlordId) return res.status(400).json({ error: 'landlordId is required' });
    if (!mongoose.isValidObjectId(tenantId)) return res.status(400).json({ error: 'Invalid tenantId' });
    if (!mongoose.isValidObjectId(landlordId)) return res.status(400).json({ error: 'Invalid landlordId' });
    if (String(landlordId) === tenantId) return res.status(400).json({ error: 'Cannot message yourself' });

    // Ensure landlord user actually exists (prevents orphan convos that won’t populate)
    const landlord = await userService.getUserById(landlordId);
    if (!landlord) return res.status(404).json({ error: 'Landlord user not found' });

    // Use ObjectIds consistently
    const tenantObjId = new mongoose.Types.ObjectId(tenantId);
    const landlordObjId = new mongoose.Types.ObjectId(String(landlordId));

    // Find-or-create conversation between exactly these 2 participants
    let convo = await Conversation.findOne({
      participants: { $all: [tenantObjId, landlordObjId], $size: 2 },
    });

    if (!convo) {
      convo = await Conversation.create({
        participants: [tenantObjId, landlordObjId],
        lastMessageAt: new Date(),
      });
      console.log('Created new convo:', convo._id);
    } else {
      console.log('Found existing convo:', convo._id);
    }

    // Optionally attach the listing context as the first message
    if (listingContext) {
      try {
        await messageService.createMessage({
          conversationId: convo._id,
          senderId: tenantId,
          messageType: 'listing_context',
          message: JSON.stringify({
            id: listingContext.id,
            title: listingContext.title,
            url: listingContext.url,
            price: listingContext.price,
            thumbnailUrl: listingContext.thumbnailUrl,
            createdAt: Date.now(),
          }),
        });
      } catch (e) {
        console.warn('Failed to attach listing_context message:', e.message);
      }
    }

    return res.json({ conversationId: convo._id });
  } catch (e) {
    console.error('POST /api/conversations/connect error:', e);
    return res.status(500).json({ error: 'Failed to connect' });
  }
});

module.exports = router;
