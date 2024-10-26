export default class RosterIconManager {
  private positionsIconData: any = {};

  public async prepareIconData(
    positionDataSet: { positionId: number; positionIcon: number }[],
  ) {
    for (const positionData of positionDataSet) {
      this.positionsIconData[positionData.positionId] = {
        iconId: positionData.positionIcon,
        iconData: await this.getIconData(positionData.positionIcon),
      };
    }
  }

  private async getIconData(positionIconId: number): Promise<any> {
    const imageDimensions = (
      imageUrl: string,
    ): Promise<{ width: number; height: number }> =>
      new Promise((resolve, reject) => {
        const img = new Image();

        img.onload = () => {
          const { naturalWidth: width, naturalHeight: height } = img;
          resolve({ width, height });
        };

        img.onerror = () => {
          reject("There was some problem with the image.");
        };

        img.src = imageUrl;
      });

    try {
      const dimensions = await imageDimensions(
        `https://fumbbl.com/i/${positionIconId}`,
      );
      const iconSize = dimensions.width / 4;
      let counter = 0;
      const iconRowVersionPositions = [];
      while (counter < dimensions.height) {
        iconRowVersionPositions.push(-1 * counter);
        counter += iconSize;
      }
      return {
        size: iconSize,
        iconRowVersionPositions: iconRowVersionPositions,
      };
    } catch (error) {
      console.error(`Failed loading icon ${positionIconId}`);
      return {
        size: 0,
        iconRowVersionPositions: [],
      };
    }
  }

  public getNextAvailableIconRowVersionPosition(
    positionId: number,
    takenIconRowVersionPositions: number[],
  ): number {
    const nextAvailableIconRowVersionPosition = this.positionsIconData[
      positionId
    ].iconData.iconRowVersionPositions.findIndex(
      (iconRowVersionPosition: any, index: number) => {
        return !takenIconRowVersionPositions.includes(index);
      },
    );
    return nextAvailableIconRowVersionPosition !== -1
      ? nextAvailableIconRowVersionPosition
      : 0;
  }

  public getIconStyle(
    positionId: number,
    iconRowVersionPosition: number | null,
  ): string {
    const positionIconInfo = this.positionsIconData[positionId];

    if (iconRowVersionPosition === null) {
      iconRowVersionPosition = 0;
    }

    const iconSize = positionIconInfo.iconData.size;

    const iconVersionPosition =
      positionIconInfo.iconData.iconRowVersionPositions[iconRowVersionPosition];

    return `width: ${iconSize}px; height: ${iconSize}px; background: rgba(0, 0, 0, 0) url("https://fumbbl.com/i/${positionIconInfo.iconId}") repeat scroll 0px ${iconVersionPosition}px;'"`;
  }
}
