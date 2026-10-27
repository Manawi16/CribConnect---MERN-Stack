// controllers/tenantController.js
const mongoose = require("mongoose");
const Tenant = require("../models/tenantSchema");

// normalize id so it works whether user_id is a String or an ObjectId in Mongo
function normalizeUserId(raw) {
  if (raw == null) return raw;
  return mongoose.Types.ObjectId.isValid(raw) ? new mongoose.Types.ObjectId(raw) : raw;
}

// GET /tenants/:user_id
async function getTenantProfile(req, res) {
  try {
    const raw = req.params.user_id ?? req.params.id; // tolerate either param name
    if (!raw) return res.status(400).json({ error: "Missing user_id in route params" });

    const userId = normalizeUserId(raw);

    const tenant = await Tenant.findOne({ user_id: userId }).lean();
    if (!tenant) return res.status(404).json({ error: "Tenant not found" });

    return res.json(tenant);
  } catch (err) {
    // surface useful detail in dev; keep message concise
    console.error("[getTenantProfile] error:", err);
    const isCast = err?.name === "CastError";
    return res.status(isCast ? 400 : 500).json({
      error: isCast ? "Invalid user_id format" : "Server error",
      detail: isCast ? err.message : undefined,
    });
  }
}

// PUT /tenants/:user_id
async function updateTenantProfile(req, res) {
  try {
    const raw = req.params.user_id ?? req.params.id;
    if (!raw) return res.status(400).json({ error: "Missing user_id in route params" });

    const userId = normalizeUserId(raw);

    // Prevent accidental empty updates
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ error: "No fields provided to update" });
    }

    // Optional: whitelist allowed fields to avoid updating protected keys
    // const allowed = ["name", "phone", "budget", "preferences", ...];
    // const updates = Object.fromEntries(Object.entries(req.body).filter(([k]) => allowed.includes(k)));
    const updates = req.body;

    const updated = await Tenant.findOneAndUpdate(
      { user_id: userId },
      { $set: updates },
      {
        new: true,
        runValidators: true,  // validate against schema on update
        context: "query",
      }
    );

    if (!updated) return res.status(404).json({ error: "Tenant not found" });

    return res.json(updated);
  } catch (err) {
    console.error("[updateTenantProfile] error:", err);
    const isCast = err?.name === "CastError";
    const isValidation = err?.name === "ValidationError";
    return res.status(isValidation || isCast ? 400 : 500).json({
      error: isValidation ? "Validation failed" : isCast ? "Invalid user_id format" : "Failed to update profile",
      detail: err.message,
      // optionally include field errors:
      fields: isValidation ? Object.fromEntries(Object.entries(err.errors).map(([k, v]) => [k, v.message])) : undefined,
    });
  }
}

module.exports = { getTenantProfile, updateTenantProfile };
