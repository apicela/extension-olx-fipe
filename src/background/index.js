console.info("Background script rodando...");
chrome.runtime.onMessage.addListener((request) => {
  if (request.type === "notificacao") {
      chrome.notifications.create({
          type: "basic",
          iconUrl: "img/logo-16.png",
          title: request.title,
          message: request.message
      });
  }
});
