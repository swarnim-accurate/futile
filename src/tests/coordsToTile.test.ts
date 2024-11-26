import { coordsToTile } from "../utils";
import { Tile } from "../types";

describe("coordsToTile", () => {
  it("should convert Hachiko Statue coordinates to tile", async () => {
    const result: Tile = await coordsToTile({ latitude: 35.6590699, longitude: 139.7006793 }, 18);
    expect(result).toEqual({ x: 232798, y: 103246, z: 18, image: null });
  });
});
