import { describe, it, expect, beforeEach } from "vitest";
import type { CharacterSheet } from "~~/shared/types/character";
import type { GameMasterScript } from "~~/shared/types/campaign";
import type { GeneratedText, I18nKey } from "~~/shared/types/utils";

// --- Fixtures ---

function gt(s: string): GeneratedText {
  return s as GeneratedText;
}

const mockCharacter: CharacterSheet = {
  archetype: "king",
  suit: "hearts",
  damage: { hearts: false, clubs: false, spades: false },
  modifiers: { hearts: 0, clubs: 0, spades: 0 },
  suitSkill: {
    name: "skill.hearts.king.name" as I18nKey,
    description: "skill.hearts.king.desc" as I18nKey,
  },
  characterIdentity: { name: gt("Test Character") },
  archetypeSkills: [],
};

const mockScript: GameMasterScript = {
  hook: gt("A dark force rises"),
  targets: {
    king: { name: gt("King Enemy"), description: gt("Desc") },
    queen: { name: gt("Queen Enemy"), description: gt("Desc") },
    jack: { name: gt("Jack Enemy"), description: gt("Desc") },
  },
  weakPoints: [{ name: gt("Weak Point"), role: gt("Role") }],
  scenes: [gt("Scene 1")],
  centralTension: gt("Central tension"),
  plot: gt("The plot"),
};

// --- Tests ---

describe("campaign store", () => {
  beforeEach(() => {
    useCampaignStore().reset();
  });

  describe("setInput", () => {
    it("writes playerCount and campaignSetting", () => {
      const store = useCampaignStore();
      store.setInput(4, ["cyberpunk", "postApocalyptic"] as Genre[]);
      expect(store.playerCount).toBe(4);
      expect(store.campaignSetting).toEqual(["cyberpunk", "postApocalyptic"]);
    });
  });

  describe("setCharacters", () => {
    it("updates characters and transitions status to characters-ready", () => {
      const store = useCampaignStore();
      store.setCharacters([mockCharacter]);
      expect(store.characters).toEqual([mockCharacter]);
      expect(store.generationStatus).toBe("characters-ready");
    });
  });

  describe("setScript", () => {
    it("updates gmScript and transitions status to done", () => {
      const store = useCampaignStore();
      store.setScript(mockScript);
      expect(store.gmScript).toEqual(mockScript);
      expect(store.generationStatus).toBe("done");
    });
  });

  describe("setError", () => {
    it("sets errorMessage and transitions status to error", () => {
      const store = useCampaignStore();
      store.setError("Something went wrong");
      expect(store.errorMessage).toBe("Something went wrong");
      expect(store.generationStatus).toBe("error");
    });
  });

  describe("reset", () => {
    it("returns all state to initial values from done state", () => {
      const store = useCampaignStore();
      store.setInput(3, ["cyberpunk"] as Genre[]);
      store.setCharacters([mockCharacter]);
      store.setScript(mockScript);

      store.reset();

      expect(store.playerCount).toBe(0);
      expect(store.campaignSetting).toEqual([]);
      expect(store.characters).toEqual([]);
      expect(store.gmScript).toBeUndefined();
      expect(store.generationStatus).toBe("idle");
      expect(store.errorMessage).toBeUndefined();
    });

    it("returns to initial state from error state", () => {
      const store = useCampaignStore();
      store.setError("failure");
      store.reset();
      expect(store.generationStatus).toBe("idle");
      expect(store.errorMessage).toBeUndefined();
    });
  });

  describe("isLoading", () => {
    it("returns false when idle", () => {
      const store = useCampaignStore();
      expect(store.isLoading).toBe(false);
    });

    it("returns true when generating-characters", () => {
      const store = useCampaignStore();
      store.generationStatus = "generating-characters";
      expect(store.isLoading).toBe(true);
    });

    it("returns false when characters-ready", () => {
      const store = useCampaignStore();
      store.setCharacters([mockCharacter]);
      expect(store.isLoading).toBe(false);
    });

    it("returns true when generating-script", () => {
      const store = useCampaignStore();
      store.generationStatus = "generating-script";
      expect(store.isLoading).toBe(true);
    });

    it("returns false when done", () => {
      const store = useCampaignStore();
      store.setScript(mockScript);
      expect(store.isLoading).toBe(false);
    });

    it("returns false when error", () => {
      const store = useCampaignStore();
      store.setError("fail");
      expect(store.isLoading).toBe(false);
    });
  });

  describe("hasResult", () => {
    it("returns false when idle", () => {
      const store = useCampaignStore();
      expect(store.hasResult).toBe(false);
    });

    it("returns false when loading", () => {
      const store = useCampaignStore();
      store.generationStatus = "generating-characters";
      expect(store.hasResult).toBe(false);
    });

    it("returns true when done", () => {
      const store = useCampaignStore();
      store.setScript(mockScript);
      expect(store.hasResult).toBe(true);
    });

    it("returns false when error", () => {
      const store = useCampaignStore();
      store.setError("fail");
      expect(store.hasResult).toBe(false);
    });
  });

  describe("campaign getter", () => {
    it("returns undefined when not done", () => {
      const store = useCampaignStore();
      expect(store.campaign).toBeUndefined();
    });

    it("returns undefined during generation", () => {
      const store = useCampaignStore();
      store.setCharacters([mockCharacter]);
      expect(store.campaign).toBeUndefined();
    });

    it("returns a Campaign object when done", () => {
      const store = useCampaignStore();
      store.setInput(2, ["cyberpunk"] as Genre[]);
      store.setCharacters([mockCharacter]);
      store.setScript(mockScript);

      expect(store.campaign).toEqual({
        name: "",
        setting: ["cyberpunk"],
        compromised: false,
        gameMasterScript: mockScript,
      });
    });
  });
});
