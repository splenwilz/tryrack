rewrite this to use python and fastapi # Full Technical Blueprint — Extended with Recommendation Engine & Complete Try Workflow

# 1. Big-picture architecture (components)

* **Mobile app (React Native)** — UI, camera, local cache, auth token storage.
* **API Gateway / Backend (Node.js + Express / NestJS)** — Authentication, orchestration, rate limiting.
* **Recommendation Service (Python microservice)** — outfit composition, scoring, business rules.
* **AI Integration Service** — wrapper for calls to Google Gemini Nanobanana (image embedding, background removal, try-on rendering).
* **Vector Store / Feature Store** — Faiss or Redis Vector + metadata store (MongoDB).
* **Relational / Document DB** — MongoDB (users, wardrobes, boutiques, orders).
* **Image Storage** — AWS S3 (or GCP Storage) with object lifecycle.
* **Cache / Session** — Redis for ephemeral state and feature caching.
* **Queue** — RabbitMQ / SQS for async jobs (background removal, heavy rendering).
* **Payments** — Stripe / Paystack / Flutterwave.
* **Analytics & Monitoring** — Prometheus, Grafana, Sentry, Postgres for analytics events.
* **CI/CD & Infra** — Docker, Kubernetes (EKS/GKE), Terraform.

---

# 2. High-level user flows (startup → try → buy) — summary

1. **App start** → Splash → Load session → Welcome / Home.
2. **User selects** Upload Clothes or Explore Boutiques.
3. **Upload** → Immediate preview → **Background Choice** (Clean / Original) → Confirm.
4. If Clean selected → enqueue background-clean job (fast path if small) → save clean image to S3 + store metadata & embeddings.
5. **Wardrobe** view: recommended outfits surfaced automatically via `GET /recommendations`.
6. **Try Workflow**: user selects outfit → Capture/upload body photo → backend composes & calls Gemini to render try-on → preview shown → options Save / Share / Buy.
7. **Buy** → checkout → payment provider → order record + webhook notifications.

---

# 3. The Try Workflow (detailed, with UX copy & branching)

This is the sequence that matters most to UX.

### A. Upload clothing item (UX strings included)

* Screen title: **“Add clothing”**
* Instruction text: “Take a clear photo or choose from your gallery. Tip: plain backgrounds give the best results.”
* Buttons: **“Take Photo”** / **“Choose from Gallery”**

After image chosen: show preview and ask:

* Prompt: **“How would you like this item stored?”**

  * Option A: **“Clean Background (Recommended)”** — description: “We’ll remove the background and store a studio-style version.”
  * Option B: **“Keep Original”** — description: “Keep the photo as you uploaded it.”
* Toggle: **“Remember my background preference”**

User taps Clean → immediate optimistic UI: **“Preparing clean image… we’ll notify you when it’s ready.”**
Implementation: enqueue a background-clean job. Show a temporary processed preview using client-side quick mask if possible; otherwise show a spinner.

### B. Background-clean job (server)

* Job payload: `image_s3_path`, `user_id`, `item_id`, `preferred_bg_color` (transparent or app-white), `return_format`.
* Worker steps:

  1. Call Gemini Nanobanana background isolation endpoint (or custom segmodel).
  2. Output: transparent PNG + flattened JPG for browsing.
  3. Store both: `s3://…/item_id/clean.png` and `…/item_id/clean_thumb.jpg`.
  4. Extract embeddings via Gemini image encoder and store in vector DB.
  5. Write metadata to MongoDB: `background_cleaned: true`, `image_paths`, `embedding_id`.

### C. Try-on initiation (user selects outfit or “Try On”)

* UX text: **“See how this looks on you — take a full-body photo or upload one.”**
* Buttons: **“Take Photo”** / **“Upload Photo”**
* Tip: “Stand straight, full-body view, shoes visible for best fit.”

Client uploads photo to S3 → call `POST /tryon` with:

```json
{
  "user_id": "uuid",
  "target_image_s3": "s3://…/user_photos/photo123.jpg",
  "items": ["item_uuid1","item_uuid2"],
  "prefer_clean_item_images": true,
  "view_options": {"rotate": true, "perspective": "frontal"}
}
```

### D. Try-on processing (server flow)

* **Synchronous/Async decision**:

  * If Gemini rendering latency low (sub-second): synchronous and return response directly.
  * Otherwise: return job id and poll / push-notify.
* Worker steps:

  1. Fetch user photo + item clean images (prefer clean images if available).
  2. Call Gemini Nanobanana `render_tryon` endpoint passing: user image, clothing assets, item segmentation masks, and desired lighting / background=original_user_photo to composite realistically.
  3. Receive try-on render and optional alternate angles or layers.
  4. Store try-on result in S3 and return preview URL + metadata (confidence score, matched items, boutique reference).
* UX when complete:

  * Title: **“Your Try-On”**
  * Subtitle: “Tap to zoom. Use the slider to change lighting/angle.”
  * Buttons: **“Save Look”**, **“Share”**, **“Buy Items”**, **“Not accurate? Give feedback”**

### E. If boutique item included

* UX overlay on try-on preview: **“This item is from [Boutique Name] — ₦12,500”**
* Buttons: **“Buy Now”** (opens in-app checkout) / **“Save for later”**

---

# 4. Data models (core collections)

### User (Mongo)

```json
{
  "_id": "user_uuid",
  "name": "string",
  "email": "string",
  "role": "user|boutique",
  "prefs": {
    "background_preference": "clean|original",
    "favorite_styles": ["minimal","street"],
    "preferred_colors": ["black","white"]
  },
  "style_vector": [float],
  "created_at":"ISODate",
  "last_login":"ISODate"
}
```

### Item (Wardrobe / Boutique item)

```json
{
  "_id": "item_uuid",
  "owner_id": "user_uuid|boutique_uuid",
  "title": "Blue Denim Jacket",
  "description": "…",
  "category":"jacket",
  "colors":["blue"],
  "sizes":["S","M","L"],
  "price": 12500, // optional for boutiques
  "image_original": "s3://…",
  "image_clean": "s3://…", // optional
  "embedding_id": "vec_123",
  "tags":["casual","denim"],
  "formality":0.3,
  "season":["spring","autumn"],
  "created_at":"ISODate"
}
```

### TryOnResult

```json
{
  "_id":"try_uuid",
  "user_id":"user_uuid",
  "items":["item_uuid1","item_uuid2"],
  "render_url":"s3://…/try_123.jpg",
  "confidence":0.92,
  "created_at":"ISODate",
  "feedback": {"accuracy": 4, "notes":"…"}
}
```

### Vector Store entry

* `embedding_id`, `item_id`, `user_id`, `vector` (512–1024 floats), `last_updated`

---

# 5. API endpoints (selected, with behavior)

* `POST /auth/signup` — create user (returns JWT)
* `POST /auth/login` — login (returns JWT)
* `POST /items` — upload item metadata (creates DB record; returns upload URL)
* `PUT /items/:id/image-uploaded` — notify server image uploaded; triggers background processing
* `POST /items/:id/background-clean` — request immediate background clean (or queue)
* `GET /wardrobe` — returns paginated items for user
* `GET /boutiques` — list boutiques (filterable)
* `GET /recommendations?user_id=...&context=...` — returns ranked outfits (see schema below)
* `POST /tryon` — initiate try-on (synchronous if fast)
* `GET /tryon/:id/status` — poll for job status
* `POST /orders` — create order
* `POST /feedback/tryon/:id` — attach user feedback to try-on

**Recommendation response schema** (short):

```json
{
  "recommendations":[
    {
      "id":"rec_uuid",
      "items":["item1","item2"],
      "score":0.92,
      "explain":["matches your color palette","suitable for warm weather"]
    }
  ]
}
```

---

# 6. Recommendation engine — technical details & workflow

This is the engine that eliminates stress from users by serving immediate, context-aware outfits.

### 6.1 Data used

* **Item embeddings** (Gemini image encoder)
* **Item metadata** (category, color, formality, season)
* **User style vector** (user embeddings derived from liked items + manual prefs)
* **Context signal** (weather, calendar event, time-of-day, location)
* **Boutique embeddings** (same pipeline as items)

### 6.2 Feature engineering

* Normalize numeric features (formality in 0–1).
* One-hot encode categories.
* Create pairwise complement features: color-contrast (computed via color distance in LAB space), silhouette match score (from embedding cosine).
* Historical features: usage frequency, recency decay (ex: last_used_timestamp → freshness score).

### 6.3 Model components

1. **Embedding similarity** — cosine similarity for pairwise item compatibility. Fast queries use Faiss (ANN).
2. **Scoring model (ensemble)**:

   * Rule-based filters (hard constraints): size availability, weather appropriateness, explicit user dislikes.
   * Learned scorer: small feed-forward neural net taking concatenated `[user_style_vector, itemA_embedding, itemB_embedding, context_vector, metadata_features]` → output `compatibility_score`.
   * Weight aggregator that combines: `final_score = w1 * compat_score + w2 * preference_score + w3 * freshness + w4 * boutique_score`.
3. **Diversification** — use MMR (Maximal Marginal Relevance) to avoid duplicates between top N suggestions.
4. **Explainability** — store top-3 contributing features per suggestion (color match, formality match, weather).

### 6.4 Real-time pipeline (request)

1. App calls `GET /recommendations`.
2. Backend aggregates: wardrobe item list + context.
3. Fast candidate retrieval:

   * For each candidate top-level piece (e.g., top), fetch top-k complementary bottoms via vector nearest neighbors.
4. Score candidates via scoring model (inference), rank.
5. Return top-3 outfits with `explain` strings.

### 6.5 Offline training & batch jobs

* Daily retrain of style model using collected `likes`, `purchases`, `tryon_feedback`.
* Periodic re-index embeddings (when new boutique items added).
* Monitor drift: if user engagement falls, push retraining with higher learning rate.

---

# 7. Example algorithm / pseudocode (outfit generation)

```python
# simplified pseudocode
def generate_recommendations(user_id, context):
    wardrobe = db.get_user_items(user_id)
    user_vector = db.get_user_vector(user_id)
    candidates = []

    for top_item in wardrobe.tops:
        top_vec = vector_store.get(top_item.embedding_id)
        bottoms_nn = vector_store.ann_query(top_vec, k=20, filter={"category":"bottom"})
        for bottom in bottoms_nn:
            score = scoring_model.predict(concat([user_vector, top_vec, bottom.vector, context_vector(context)]))
            candidates.append({"items":[top_item.id, bottom.id], "score":score})

    ranked = sort_by_score(candidates)
    diversified = apply_mmr(ranked, lambda x: x['score'])
    return top_n(diversified, 3)
```

---

# 8. Integration with Gemini Nanobanana (practical points)

* **Use-cases**:

  * Image tagging & embeddings → quick calls for every new item upload.
  * Background removal → called from background job (async).
  * Try-on rendering → heavier call, may be sync/async depending on latency SLA.
* **API patterns**:

  * Throttle calls; use local caching for popular boutique images.
  * For background removal, call once per item and store cleaned result; reuse for try-ons.
* **Quality control**:

  * Provide a manual override in the UI to re-crop or re-select the mask if background clean fails.
  * Add a “Fix Image” UX path that lets user quickly retake.

---

# 9. Performance, Scalability, and Latency goals

* **Target latencies**:

  * Upload acknowledgement: < 300ms
  * Background-clean job enqueue: immediate; processed in background (goal: < 30s)
  * Recommendation API: < 200ms typical (use caching + ANN)
  * Try-on render: best-effort < 5s synchronous; else async with push.
* **Scaling**:

  * Vector store & recommendation service horizontally scalable.
  * Use autoscaling for heavy render workers.
* **Cost control**:

  * Cache popular boutique item embeddings.
  * Use cheaper in-house segmentation model for background isolation if cost of Gemini calls is high; keep Gemini for highest-fidelity rendering.

---

# 10. Security, privacy, UX safety

* **Auth**: JWT + refresh tokens. Role-based access (user vs boutique).
* **PII**: store minimal personal info. Encrypt in transit & at rest.
* **User Photos**: treat as sensitive — allow users to delete originals + derived try-on results. Provide “Delete my photos” flow.
* **Permissions**: ask for camera only when needed; explain why.

---

# 11. Monitoring & Key metrics

* **ML/UX metrics**:

  * Try-on conversion rate (try → save / try → buy).
  * Recommendation acceptance (recommended outfit clicked / tried).
  * Feedback accuracy (user rating of try-on).
  * Latency percentiles for recommendation & try-on.
* **Business metrics**:

  * Boutique conversion rate
  * Average order value
  * Active users with saved outfits
* **Alerts**:

  * Try-on worker error rate > 2%
  * Recommendation latency P95 > 500ms

---

# 12. Developer-ready checklist & MVP scope

**MVP features (recommended):**

1. User auth + profile
2. Wardrobe upload with Background Choice (Clean/Original) — background-clean async worker
3. Basic image tagging (Gemini or internal)
4. Recommendation API (content-based + user prefs) — return top 3 outfits
5. Try-on endpoint (sync for 1 item, async fallback for heavy)
6. Boutique upload & basic catalog
7. In-app checkout (Stripe / Paystack)
8. Feedback capture for try-on accuracy

**MVP non-blockers (phase 2):**

* AR live try-on
* Advanced personalization (sequence models)
* Full analytics dashboard for boutiques (simple metrics only in MVP)

---

# 13. Additional UX & copy notes (so devs or designers can wire screens immediately)

* Upload screen copy:

  * Title: **“Add item to wardrobe”**
  * Secondary: “For best results, photograph garments laid flat or on a hanger against a plain background.”
* Background choice modal:

  * Title: **“How should we store this item?”**
  * Clean option button: **“Clean background (studio look)”** — note: “Recommended”
  * Original option button: **“Keep original”**
* Try-on processing:

  * Title: **“Generating your try-on…”**
  * Subtitle: “High-quality preview — this may take a few seconds.”
* Recommendation tooltip:

  * “Why this outfit?” → show 2–3 reasons, e.g. “Matches your color palette”, “Great for 28°C and sunny”, “You liked a similar look last month.”

---

# 14. Next deliverables I can produce right away (choose any)

* API contract document (OpenAPI / Swagger) for all endpoints above.
* Sequence diagram (SVG) showing full try workflow including background-clean job and async try-on.
* Minimal backend repo skeleton (Express + Python recommender microservice) with example endpoints and mock responses.
* Data schema migration scripts and sample MongoDB documents.
