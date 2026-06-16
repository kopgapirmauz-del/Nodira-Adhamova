const TELEGRAM_BOT_TOKEN = "8895398777:AAEhOVxnWgauRS4MH6_DgUzUvUNlDD8VnAY";
const TELEGRAM_CHAT_IDS = ["7856944337", "5910634397", "2012162766"];

const form = document.querySelector("#lead-form");
const statusEl = document.querySelector("#form-status");
const reviewsSlider = document.querySelector("#reviews-slider");
const reviewPrev = document.querySelector(".review-nav.prev");
const reviewNext = document.querySelector(".review-nav.next");

if (reviewsSlider && reviewPrev && reviewNext) {
  const scrollReviews = (direction) => {
    const card = reviewsSlider.querySelector(".review-card");
    const cardWidth = card ? card.getBoundingClientRect().width + 18 : 420;
    reviewsSlider.scrollBy({ left: direction * cardWidth, behavior: "smooth" });
  };

  reviewPrev.addEventListener("click", () => scrollReviews(-1));
  reviewNext.addEventListener("click", () => scrollReviews(1));
}

function setStatus(message, type) {
  statusEl.textContent = message;
  statusEl.className = `form-status ${type || ""}`.trim();
}

function isTelegramConfigured() {
  return TELEGRAM_BOT_TOKEN !== "YOUR_BOT_TOKEN" && TELEGRAM_CHAT_IDS.every((chatId) => chatId !== "YOUR_CHAT_ID");
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const data = new FormData(form);
  const fullName = data.get("fullName").trim();
  const phone = data.get("phone").trim();
  const profession = data.get("profession");

  if (!isTelegramConfigured()) {
    setStatus("Telegram bot token va chat ID script.js ichida sozlanmagan.", "error");
    return;
  }

  const message = [
    "Yangi lead: Nodira Adhamova landing",
    `Ism familya: ${fullName}`,
    `Telefon: ${phone}`,
    `Kasbi: ${profession}`,
    `Vaqt: ${new Date().toLocaleString("uz-UZ")}`,
  ].join("\n");

  const submitButton = form.querySelector("button[type='submit']");
  submitButton.disabled = true;
  submitButton.textContent = "Yuborilmoqda...";
  setStatus("", "");

  try {
    const responses = await Promise.all(
      TELEGRAM_CHAT_IDS.map((chatId) =>
        fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            text: message,
          }),
        })
      )
    );

    if (responses.some((response) => !response.ok)) {
      throw new Error("Telegram API xatolik qaytardi");
    }

    form.reset();
    setStatus("Arizangiz yuborildi. Tez orada siz bilan bog‘lanamiz.", "success");
  } catch (error) {
    setStatus("Ariza yuborilmadi. Iltimos, keyinroq urinib ko‘ring.", "error");
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "Ariza yuborish";
  }
});
