export default defineAppConfig({
  ui: {
    colors: {
      primary: "terminal",
      neutral: "slate",
      error: "red",
    },
    button: {
      slots: {
        base: "rounded-none uppercase cursor-pointer",
      },
      variants: {
        variant: {
          outline: "pixel-border",
        },
      },
      compoundVariants: [
        {
          variant: "outline" as const,
          class: {
            leadingIcon: "text-primary-800",
            label: "text-primary-800",
            base: "hover:bg-primary-400/30",
          },
        },
      ],
    },
    badge: {
      slots: {
        base: "rounded-none",
      },
      variants: {
        variant: {
          outline: "pixel-border",
        },
      },
    },
    card: {
      slots: {
        root: "rounded-none shadow-none",
      },
    },
    alert: {
      slots: {
        root: "rounded-none shadow-none",
      },
    },
    input: {
      slots: {
        base: "rounded-none",
      },
    },
    inputNumber: {
      slots: {
        base: "rounded-none",
      },
    },
    checkbox: {
      slots: {
        base: "rounded-none",
      },
    },
    tooltip: {
      slots: {
        content: "rounded-none shadow-none",
      },
    },
    modal: {
      slots: {
        content: "rounded-none shadow-none",
      },
    },
    popover: {
      slots: {
        content: "rounded-none shadow-none",
      },
    },
    select: {
      slots: {
        base: "rounded-none",
        content: "rounded-none shadow-none",
      },
    },
    dropdownMenu: {
      slots: {
        content: "rounded-none shadow-none",
      },
    },
    table: {
      slots: {
        base: "rounded-none",
      },
    },
  },
});
