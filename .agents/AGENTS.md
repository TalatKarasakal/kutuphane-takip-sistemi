# Agent Behavior & Project Tracking Guidelines

Whenever working in this workspace, follow these rules regarding `PROJECT_TRACKER.md`:

1. **Status & Task Lookup (`PROJECT_TRACKER.md`)**:
   - If the user asks about project status ("Belgenin durumu nedir?", "Ne var ne yok?"), inspect [PROJECT_TRACKER.md](file:///Users/talatkarasakal/Documents/GitHub/kutuphane-takip-sistemi/PROJECT_TRACKER.md) and provide a clean summary.
   - If the user says "Sıradaki sorunu çöz" or asks to pick up the next task, read [PROJECT_TRACKER.md](file:///Users/talatkarasakal/Documents/GitHub/kutuphane-takip-sistemi/PROJECT_TRACKER.md) to locate the top priority issue or backlog item.

2. **Pending Verification Flow**:
   - When you complete an issue or feature, move the item to **"4. Kontrol Edilecek Çözümler"** in [PROJECT_TRACKER.md](file:///Users/talatkarasakal/Documents/GitHub/kutuphane-takip-sistemi/PROJECT_TRACKER.md).
   - Inform the user: *"İlgili çözümü tamamladım ve 'Kontrol Edilecek Çözümler' kısmına ekledim. Lütfen kontrol edin; onaylarsanız belgeden kaldırayım."*
   - Once the user confirms the fix, remove the entry from [PROJECT_TRACKER.md](file:///Users/talatkarasakal/Documents/GitHub/kutuphane-takip-sistemi/PROJECT_TRACKER.md).

3. **Model Tagging**:
   - Whenever adding a proposed solution to section 3 ("Sorunlara Çözüm Önerileri"), include the exact AI model tag (e.g. `[Model: Gemini 3.6 Flash]`).

4. **Rejected Suggestions**:
   - If the user rejects a proposal, log it under section 6 ("Reddedilen Öneriler") in [PROJECT_TRACKER.md](file:///Users/talatkarasakal/Documents/GitHub/kutuphane-takip-sistemi/PROJECT_TRACKER.md) so agents do not re-suggest it.

5. **Token Saving & Selective Reading**:
   - Do NOT scan the entire project to generate architectural/feature improvement suggestions unless the user explicitly requests recommendations.
   - Do NOT read [PROJECT_TRACKER.md](file:///Users/talatkarasakal/Documents/GitHub/kutuphane-takip-sistemi/PROJECT_TRACKER.md) on every unrelated prompt; only access it when requested or relevant to task management.
