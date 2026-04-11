# Vietnamese blog writing guide

This guide helps adapt English drafts into Vietnamese posts that sound like a local dev sharing a problem and a fix, not a translation. The goal is to keep the tone warm, direct, and personal so readers feel like a developer friend is describing what happened on the job. Think of it as a quick reminder of how we talk in the Vietnamese tech scene before you hit publish.

## persona
- Self: default to `mình`, which keeps the voice warm and personal. Reach for `tôi` only when you want to sound reflective or authoritative, and never mix the two inside one paragraph.
- Reader: address the audience as `bạn` for standard guidance and `anh em` when the tone leans casual and familiar.
- Never use `quý vị` or `các bạn đọc` here; the blog is a personal space, not a corporate newsletter.

## information parity (english as anchor)
- The English version is the immutable source of truth. You have absolute freedom to change sentence structures or swap metaphors to sound natural in Vietnamese, but **you cannot drop data**. If a statistic, a hyperlink, or a sub-claim exists in the English source, it must exist in the Vietnamese counterpart.
- **Filename Parity**: The translated file (`content/vi/blogs/YYMMDD-slug.mdx`) must have the exact same filename as the English source, or the "Read in English/Vietnamese" toggle on the live site will crash or 404.

## paragraph logic (critical)
- **Do not preserve the English essay skeleton too faithfully.** English is the source of truth for facts, links, and claims — it is **not** the source of truth for paragraph movement.
- When a paragraph feels translated, the problem is usually structural, not lexical. Replacing a few words will not fix it. Rewrite the whole paragraph in Vietnamese.
- The most common English skeleton to destroy is: **claim → explanation → summary restatement**. In Vietnamese, opinion writing often lands better as **observation → punchline → expansion** or **story beat → reaction → point**.
- Another common English carryover: **clean rhetorical checklisting**. If the English source has 4-5 mirrored questions or concessions in separate lines, Vietnamese often works better when those become **one rising thought** or **one breathless clause** instead of a neat list.
- If a sentence only explains what the previous sentence already proved, cut it. Translationese hides in connective tissue.
- The goal is **a local original with information parity**, not a faithful sentence-by-sentence rendering.

## tech term handling
- Keep the core terms in English: `bug`, `deploy`, `feature`, `app`, `codebase`, `refactor`, `hardcode`, `framework`, `side-project`, `junior/senior`, `PR`, `code review`, `token`, `prompt`, `agent`.
- When you introduce a new or uncommon idea, give the Vietnamese translation first and then the English term in parentheses on first use. Example: "Lập trình theo cảm hứng (Vibe Coding) là cách mình hay làm dự án nhỏ." After that, you can pick whichever version feels most natural.
- Avoid translating the core terms above — alternatives like `gỡ lỗi`, `triển khai`, `mã cứng`, `khung làm việc` sound dated or overly literal.
- But do not keep an English term by force. If the English token starts pulling attention to itself or makes the Vietnamese sentence sound imported, rewrite the whole clause in Vietnamese instead of defending the token. The sentence matters more than the token.

## translation by metaphor (not dictionary)
- Never translate tech analogies literally if a local cultural or dev-slang equivalent exists.
  - ❌ "Rubber-stamp a plan" -> Đóng dấu thông qua một kế hoạch.
  - ✅ "Rubber-stamp a plan" -> **Gật đầu bừa** cho một kế hoạch.
  - ❌ "Nobody's home" -> Chẳng có ai ở nhà.
  - ✅ "Nobody's home" -> Chẳng có ai **cầm lái**.
- If you introduce a metaphor (`ông landlord`, `dọn đời sang nhà nó`, `cái cửa chỉ mở một chiều`), keep it alive across the paragraph. Do not open with a vivid image and then collapse back into dry abstract nouns one sentence later.

## banned vocabulary
| Banned | Why / use instead |
|--------|-------------------|
| `kỷ nguyên số` / `thời đại số` | Grand openers that feel AI-written — just start with the problem |
| `bức tranh toàn cảnh` | "The grand picture" is vague — zoom in on the concrete detail |
| `sức mạnh của...` | "The power of..." signals showmanship — show the effect instead |
| `nắm bắt` / `đón nhận` (as in "embrace") | The phrasing feels translated — drop it or rewrite |
| `hành trình` | "Journey" is overused — cut it |
| `nhìn chung` / `tóm lại` | Real bloggers do not summarize their own posts that way |
| `hơn thế nữa` / `thêm vào đó` | Swap for `ngoài ra`, `chưa kể`, `nhưng mà` |
| `điều quan trọng cần lưu ý là...` | Use `lưu ý là...` or `anh em nhớ...` instead |
| `chào mừng các bạn đến với bài viết...` | Never open with a welcome sentence |
| `trong bối cảnh công nghệ phát triển nhanh chóng...` | Cut the whole sentence; jump straight into the observation |

## grammar anti-patterns
- Passive + "bởi":
  - ❌ "Ứng dụng được xây dựng bởi team mình"
  - ✅ "Team mình xây dựng ứng dụng này"
- Stacking `các/những`:
  - ❌ "Các lập trình viên nên viết các bài test cho các ứng dụng"
  - ✅ "Lập trình viên nên viết test cho ứng dụng"
- Pronoun overload (nó/họ):
  - ❌ "Next.js là framework. Nó giúp bạn render phía server."
  - ✅ "Next.js là framework giúp render phía server."
- Possessive overuse (của bạn):
  - ❌ "Kỹ năng code của bạn sẽ cải thiện"
  - ✅ "Kỹ năng code sẽ cải thiện"

## the "burstiness" rhythm
- Translated Vietnamese naturally tends to become long, run-on, and overly explanatory. You must actively fracture these into short, punchy 3-5 word bursts to maintain the authoritative "Senior Engineer" cadence.
  - ❌ "Một người có kiến thức sâu có thể quét sạch đống backlog trong một buổi chiều."
  - ✅ "Một người có kiến thức sâu có thể quét sạch đống backlog... Một người. Một buổi chiều."
- Burstiness is not just sentence length. It is also **thought movement**. A translated paragraph can have short sentences and still feel English if the logic is too symmetrical or too neatly explained.
- But do not confuse burstiness with list formatting. A Vietnamese paragraph can be punchy without becoming a stack of one-line checklist items. If a block starts to look like a slide deck, fold it back into living prose.

## formatting rules
- Use sentence case for every heading from H1 down to H4, including the post title. Capitalize only the first word and any proper nouns.
  - ❌ "Cách Xây Dựng Một Ứng Dụng React"
  - ✅ "Cách xây dựng một ứng dụng React"
- Favor commas and periods over em-dashes and semicolons; Vietnamese prose flows with shorter punctuation.
- Emoji should feel natural and singular; one or two per post max. 😅 🤔 work when they match the tone, but avoid a row of 🎉🚀✨ that reads like marketing copy.
- Skip exclamation-mark openers:
  - ❌ "Hãy cùng khám phá nhé!"
  - ✅ "Mình vừa khám phá ra thứ này..."

## sentence-ending particles (use sparingly)
- `nhé` for friendly suggestions: "Anh em thử cái này nhé."
- `nha` when you want a softer encouragement: "Cái này dùng được lắm nha."
- `nhỉ` after a rhetorical statement: "Nghe đơn giản nhỉ?"
- `đấy chứ` for mild emphasis: "Nó lại hoạt động đấy chứ."
- If a sentence already sounds natural, skip the particle rather than forcing it.

## natural transitions
- `Nhưng mà` / `Cơ mà` — casual but clear contrast.
- `Thật ra thì` — truthful introduction to a correction or confession.
- `Nói thế chứ` — that said, having said that.
- `Chưa kể` — not to mention.
- `Ngoài ra` — besides, on top of that.

## opener rule
- Always start with the problem, a story, or an observation. Jump straight into what happened rather than setting the scene.
  - ❌ "Chào mừng các bạn đến với bài viết hôm nay về..."
  - ❌ "Trong bài viết này, mình sẽ giới thiệu..."
  - ✅ "Hôm qua mình vừa gặp một bug khá khoai."
  - ✅ "Mình vừa chuyển sang OpenCode được hai tuần và có vài thứ muốn chia sẻ."

## authentic register
- Casual frustration or self-deprecating humor signals a real dev voice: "Mình ngồi debug mãi mà không ra..." feels believable.
- Light slang (`toang`, `dính chưởng`) is fine when it fits the moment — do not sprinkle them just to sound local.
- The goal is to sound like talking to a dev friend over coffee, not delivering a presentation.
- Watch power dynamics in verb choice. If a product/tool is really demanding trust, data, or migration cost from the user, `đòi` may be more honest than `xin`.

## structural anti-patterns for Vietnamese translations
- Avoid headings or transitions that sound like translated essays:
  - ❌ `Vấn đề thật ra nằm ở...`
  - ❌ `Phe phản biện dễ đoán nhất là...`
  - ❌ `Điều này cho thấy...`
  - ✅ `Đến đoạn này thì...`
  - ✅ `Mình biết kiểu phản biện này rồi...`
  - ✅ `Cái khó chịu nằm ở chỗ...`
- Avoid symmetrical sentence pairs that restate themselves:
  - ❌ `Vấn đề không nằm ở X. Vấn đề nằm ở Y.`
  - ✅ Lead with the real point, then qualify it if needed.
- Avoid English-style rhetorical checklists:
  - ❌ four or five one-line `Nếu... không?` questions in a row
  - ✅ one rising anxious thought that lets the fear pile up naturally
  - ❌ `Có thể X. Có thể Y. Có thể Z.` as neat concession steps
  - ✅ compress the concession into one shrug or one condition, then move on
- Avoid carrying over English rhetorical closers like:
  - ❌ `Chỗ lệch đó chính là nơi X bắt đầu.`
  - ❌ `Đó là lúc mọi thứ thay đổi.`
  - ✅ Let the concrete sentence land, or restate in a more local, less abstract way.
- When a paragraph wants to land hard, prefer a concrete image over an imported abstract label.
  - ❌ `Đó là lock-in.`
  - ✅ `Đó là cái cửa chỉ mở một chiều.`
- If a paragraph sounds like a translated conference talk, rewrite it until it sounds like a Vietnamese dev rant or confession instead.

## sentence pressure
- Put the sharpest word where the sentence lands hardest. Vietnamese opinion writing often gets its punch from what comes last.
  - Weaker: ending on a soft abstract noun like `thói quen`
  - Stronger: ending on a sharper, more thematically loaded phrase like `cái cách mình nhớ`
- If a sentence lists escalating costs or requests, make sure the final item is the deepest cut, not the safest one.

## link annotations
- Follow the same annotation rules in content/AGENTS.md: always annotate external links with `[text](url "type | note")`. That guide lists the six types and examples, so point new writers there instead of rewriting the whole section.
