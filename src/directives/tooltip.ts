import type { DirectiveBinding } from "vue";
import { createApp, h } from "vue";

export default {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    if (window.innerWidth >= 1024) {
      let tooltipElement: HTMLElement;
      const tooltipText = binding.value;
      const position = binding.arg || "top";

      const showTooltip = () => {
        const rect = el.getBoundingClientRect();
        const tooltipApp = createApp({
          render() {
            return h("div", { class: "tooltip" }, tooltipText);
          },
        });

        tooltipElement = tooltipApp.mount(document.createElement("div"))
          .$el as HTMLElement;
        document.body.appendChild(tooltipElement);

        const tooltipRect = tooltipElement.getBoundingClientRect();

        const top = rect.top + window.scrollY;
        const left = rect.left + window.scrollX;

        switch (position) {
          case "top":
            tooltipElement.style.top = `${top - tooltipRect.height - 10}px`;
            tooltipElement.style.left = `${
              left + rect.width / 2 - tooltipRect.width / 2
            }px`;
            break;
          case "bottom":
            tooltipElement.style.top = `${top + rect.height + 10}px`;
            tooltipElement.style.left = `${
              left + rect.width / 2 - tooltipRect.width / 2
            }px`;
            break;
          case "left":
            tooltipElement.style.top = `${
              top + rect.height / 2 - tooltipRect.height / 2
            }px`;
            tooltipElement.style.left = `${left - tooltipRect.width - 10}px`;
            break;
          case "right":
            tooltipElement.style.top = `${
              top + rect.height / 2 - tooltipRect.height / 2
            }px`;
            tooltipElement.style.left = `${left + rect.width + 10}px`;
            break;
        }

        tooltipElement.classList.add("visible");
      };

      const hideTooltip = () => {
        if (tooltipElement) {
          tooltipElement.classList.remove("visible");
          document.body.removeChild(tooltipElement);
        }
      };

      el.addEventListener("mouseenter", showTooltip);
      el.addEventListener("mouseleave", hideTooltip);
    }
  },
};
