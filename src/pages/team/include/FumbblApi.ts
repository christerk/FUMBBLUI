import Axios from "axios";
import { PlayerGender } from "./Interfaces";
import ApiResponse from "./ApiResponse";
import PromiseQueue from "./PromiseQueue";

export default class FumbblApi {
  private readonly ERROR_WITHIN_SUCCESS_PREFIX = "Error:";
  private queue: PromiseQueue;
  private readonly simulateDelay: boolean = false;
  private enableOauth: boolean = false;
  private accessToken: string = "";
  private tokenExpiry: number = 0;
  public baseApiUrl: string = "";

  constructor() {
    this.queue = new PromiseQueue();
    this.enableOauth = import.meta.env.VITE_ENABLE_OAUTH == "true";

    let apiBase = import.meta.env.VITE_API_URL;

    if (!apiBase) {
      apiBase = window.location.origin;
    }

    this.baseApiUrl = apiBase;
  }

  protected getUrl(apiUrl: string): string {
    return this.baseApiUrl + apiUrl;
  }

  protected async getAccessToken(): Promise<string> {
    if (Date.now() > this.tokenExpiry) {
      const data = {
        grant_type: "client_credentials",
        client_id: import.meta.env.VITE_CLIENT_ID,
        client_secret: import.meta.env.VITE_CLIENT_SECRET,
      };
      this.enableOauth = false;
      const result = await this.post(this.getUrl("/api/oauth/token"), data);
      this.enableOauth = true;
      const tokenData = result.data;

      this.tokenExpiry = Date.now() + tokenData.expires_in * 1000 - 10;
      this.accessToken = tokenData.access_token;
    }
    return this.accessToken;
  }

  protected async getAuthHeaders() {
    let headers = {};
    if (this.enableOauth) {
      const token = await this.getAccessToken();
      headers = {
        headers: {
          Authorization: "Bearer " + token,
        },
      };
    }
    return headers;
  }

  protected async post(
    url: string,
    data: any = null,
    transform: ((d: any) => any) | null = null,
  ): Promise<ApiResponse> {
    if (this.simulateDelay) {
      await this.delay(1000);
    }

    let result;
    try {
      result = await Axios.post(url, data, await this.getAuthHeaders());
    } catch (error) {
      return ApiResponse.error(error);
    }

    let resultData = result.data;
    if (this.isErrorWithinSuccess(resultData)) {
      return ApiResponse.customErrorString(
        resultData.replace(this.ERROR_WITHIN_SUCCESS_PREFIX, ""),
      );
    }

    if (transform !== null) {
      resultData = transform(resultData);
    }

    return ApiResponse.success(resultData);
  }

  protected async enqueuePost(
    url: string,
    data: any = null,
    transform: ((d: any) => any) | null = null,
  ): Promise<ApiResponse> {
    return await this.queue.add(async () => {
      if (this.simulateDelay) {
        await this.delay(1000);
      }

      let result = null;
      try {
        result = await Axios.post(url, data, await this.getAuthHeaders());
      } catch (error) {
        return ApiResponse.error(error);
      }

      let resultData = result.data;
      if (this.isErrorWithinSuccess(resultData)) {
        return ApiResponse.customErrorString(
          resultData.replace(this.ERROR_WITHIN_SUCCESS_PREFIX, ""),
        );
      }

      if (transform !== null) {
        resultData = transform(resultData);
      }

      return ApiResponse.success(resultData);
    });
  }

  /**
   * Only used during testing to simulate delays
   */
  private delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  protected isErrorWithinSuccess(data: any): boolean {
    return (
      typeof data === "string" &&
      data.startsWith(this.ERROR_WITHIN_SUCCESS_PREFIX)
    );
  }

  public async setSpecialRule(
    teamId: number,
    ruleName: string,
    ruleValue: string,
  ): Promise<ApiResponse> {
    const url = this.getUrl("/api/team/setSpecialRule/" + teamId);
    const data = { rule: ruleName, val: ruleValue };
    return await this.enqueuePost(url, data);
  }

  public async getRulesetIdForDivision(
    divisionId: number,
  ): Promise<ApiResponse> {
    const url = this.getUrl("/api/division/get/" + divisionId);
    const data = null;
    const transform = (result: any) => ~~result.rulesetId;
    return await this.post(url, data, transform);
  }

  public async getRulesetIdForGroup(groupId: number): Promise<ApiResponse> {
    const url = this.getUrl("/api/group/get/" + groupId);
    const data = null;
    const transform = (result: any) => ~~result.ruleset;
    return await this.post(url, data, transform);
  }

  public async getRuleset(rulesetId: number): Promise<ApiResponse> {
    const url = this.getUrl("/api/ruleset/get/" + rulesetId);
    return await this.post(url);
  }

  public async getRosters(rulesetId: number): Promise<ApiResponse> {
    const url = this.getUrl("/api/roster/list/" + rulesetId);
    return await this.post(url);
  }

  public async getTeamsForCoach(coachName: string): Promise<ApiResponse> {
    const url = this.getUrl("/api/coach/teams/" + coachName);
    const data = null;
    const transform = (result: any) => result.teams;
    return await this.post(url, data, transform);
  }

  public async getTrophyStatus(coachName: string): Promise<ApiResponse> {
    const url = this.getUrl("/api/boxtrophy/coachStatus/" + coachName);
    return await this.post(url);
  }

  public async getRecentTrophyMatches(): Promise<ApiResponse> {
    const url = this.getUrl("/api/boxtrophy/recent");
    return await this.post(url);
  }

  public async selectSquad(coachName: string, teams: number[]) {
    // const data = new URLSearchParams();
    // data.append("coach", this.coachName);
    // data.append("teams", JSON.stringify(teams));

    const data = {
      coach: coachName,
      teams: teams,
    };

    const url = this.getUrl("/api/boxtrophy/selectsquad");

    return await this.post(url, data);
  }

  public async getRoster(rosterId: number): Promise<ApiResponse> {
    const url = this.getUrl("/api/roster/get/" + rosterId);
    return await this.post(url);
  }

  public async getTeam(teamId: number): Promise<ApiResponse> {
    const url = this.getUrl("/api/team/get/" + teamId);
    return await this.post(url);
  }

  public async getPlayer(playerId: number): Promise<ApiResponse> {
    const url = this.getUrl("/api/player/get/" + playerId);
    return await this.post(url);
  }

  public async generatePlayerName(
    nameGenerator: string,
    gender: PlayerGender,
  ): Promise<ApiResponse> {
    const url = this.getUrl(
      `/api/name/generate/${nameGenerator}/${gender.toLowerCase()}`,
    );
    return await this.post(url);
  }

  public async checkTeamName(teamName: string): Promise<ApiResponse> {
    const url = this.getUrl("/api/team/checkName");
    const data = { name: teamName };
    return await this.post(url, data);
  }

  public async renameTeam(
    teamId: number,
    newName: string,
  ): Promise<ApiResponse> {
    const url = this.getUrl("/api/team/rename");
    const data = { teamId: teamId, newName: newName };
    return await this.enqueuePost(url, data);
  }

  protected async simplePostWithOnlyTeamIdInBody(
    teamId: number,
    url: string,
  ): Promise<ApiResponse> {
    const data = { teamId: teamId };
    return await this.enqueuePost(url, data);
  }

  public async addReroll(teamId: number): Promise<ApiResponse> {
    return await this.simplePostWithOnlyTeamIdInBody(
      teamId,
      this.getUrl("/api/team/addReroll"),
    );
  }

  public async removeReroll(teamId: number): Promise<ApiResponse> {
    return await this.simplePostWithOnlyTeamIdInBody(
      teamId,
      this.getUrl("/api/team/removeReroll"),
    );
  }

  public async discardReroll(teamId: number): Promise<ApiResponse> {
    return await this.simplePostWithOnlyTeamIdInBody(
      teamId,
      this.getUrl("/api/team/discardReroll"),
    );
  }

  public async addAssistantCoach(teamId: number): Promise<ApiResponse> {
    return await this.simplePostWithOnlyTeamIdInBody(
      teamId,
      this.getUrl("/api/team/addAssistantCoach"),
    );
  }

  public async removeAssistantCoach(teamId: number): Promise<ApiResponse> {
    return await this.simplePostWithOnlyTeamIdInBody(
      teamId,
      this.getUrl("/api/team/removeAssistantCoach"),
    );
  }

  public async fireAssistantCoach(teamId: number): Promise<ApiResponse> {
    return await this.simplePostWithOnlyTeamIdInBody(
      teamId,
      this.getUrl("/api/team/fireAssistantCoach"),
    );
  }

  public async addCheerleader(teamId: number): Promise<ApiResponse> {
    return await this.simplePostWithOnlyTeamIdInBody(
      teamId,
      this.getUrl("/api/team/addCheerleader"),
    );
  }

  public async removeCheerleader(teamId: number): Promise<ApiResponse> {
    return await this.simplePostWithOnlyTeamIdInBody(
      teamId,
      this.getUrl("/api/team/removeCheerleader"),
    );
  }

  public async fireCheerleader(teamId: number): Promise<ApiResponse> {
    return await this.simplePostWithOnlyTeamIdInBody(
      teamId,
      this.getUrl("/api/team/fireCheerleader"),
    );
  }

  public async addApothecary(teamId: number): Promise<ApiResponse> {
    return await this.simplePostWithOnlyTeamIdInBody(
      teamId,
      this.getUrl("/api/team/addApothecary"),
    );
  }

  public async removeApothecary(teamId: number): Promise<ApiResponse> {
    return await this.simplePostWithOnlyTeamIdInBody(
      teamId,
      this.getUrl("/api/team/removeApothecary"),
    );
  }

  public async fireApothecary(teamId: number): Promise<ApiResponse> {
    return await this.simplePostWithOnlyTeamIdInBody(
      teamId,
      this.getUrl("/api/team/fireApothecary"),
    );
  }

  public async setTreasury(
    teamId: number,
    newTreasury: number,
  ): Promise<ApiResponse> {
    const url = this.getUrl("/api/team/setTreasury");
    const data = { teamId: teamId, newTreasury: newTreasury };
    return await this.enqueuePost(url, data);
  }

  public async setDedicatedFans(
    teamId: number,
    newDedicatedFans: number,
  ): Promise<ApiResponse> {
    const url = this.getUrl("/api/team/changeDedicatedFans");
    const data = { teamId: teamId, newDf: newDedicatedFans };
    return await this.enqueuePost(url, data);
  }

  public async addDedicatedFans(teamId: number): Promise<ApiResponse> {
    return await this.simplePostWithOnlyTeamIdInBody(
      teamId,
      this.getUrl("/api/team/addDedicatedFans"),
    );
  }

  public async removeDedicatedFans(teamId: number): Promise<ApiResponse> {
    return await this.simplePostWithOnlyTeamIdInBody(
      teamId,
      this.getUrl("/api/team/removeDedicatedFans"),
    );
  }

  public async renameAllPlayers(teamId: number): Promise<ApiResponse> {
    return await this.simplePostWithOnlyTeamIdInBody(
      teamId,
      this.getUrl("/api/team/renameAllPlayers"),
    );
  }

  public async addPlayer(
    teamId: number,
    positionId: number,
    gender: PlayerGender,
    playerName: string,
  ): Promise<ApiResponse> {
    const url = this.getUrl("/api/team/addPlayer");
    const data = {
      teamId: teamId,
      positionId: positionId,
      gender: gender.toLowerCase(),
      name: playerName,
    };
    return await this.enqueuePost(url, data);
  }

  public async removePlayer(
    teamId: number,
    playerId: number,
  ): Promise<ApiResponse> {
    const url = this.getUrl("/api/team/removePlayer");
    const data = { teamId: teamId, playerId: playerId };
    return await this.enqueuePost(url, data);
  }

  public async refundPlayer(
    teamId: number,
    playerId: number,
  ): Promise<ApiResponse> {
    const url = this.getUrl("/api/team/refundPlayer");
    const data = { teamId: teamId, playerId: playerId };
    return await this.enqueuePost(url, data);
  }

  public async firePlayer(
    teamId: number,
    playerId: number,
  ): Promise<ApiResponse> {
    const url = this.getUrl("/api/team/firePlayer");
    const data = { teamId: teamId, playerId: playerId };
    return await this.enqueuePost(url, data);
  }

  public async rehirePlayer(
    teamId: number,
    playerId: number,
  ): Promise<ApiResponse> {
    const url = this.getUrl("/api/team/rehirePlayer");
    const data = { teamId: teamId, playerId: playerId };
    return await this.enqueuePost(url, data);
  }

  public async retirePlayer(
    teamId: number,
    playerId: number,
  ): Promise<ApiResponse> {
    const url = this.getUrl("/api/team/retirePlayer");
    const data = { teamId: teamId, playerId: playerId };
    return await this.enqueuePost(url, data);
  }

  public async temporaryRetirePlayer(
    teamId: number,
    playerId: number,
  ): Promise<ApiResponse> {
    const url = this.getUrl("/api/team/temporaryRetirePlayer");
    const data = { teamId: teamId, playerId: playerId };
    return await this.enqueuePost(url, data);
  }

  public async undoTempRetirement(
    teamId: number,
    playerId: number,
  ): Promise<ApiResponse> {
    const url = this.getUrl("/api/team/undoTemporaryRetire");
    const data = { teamId: teamId, playerId: playerId };
    return await this.enqueuePost(url, data);
  }

  public async hireJourneyman(
    teamId: number,
    playerId: number,
  ): Promise<ApiResponse> {
    const url = this.getUrl("/api/team/hireJourneyman");
    const data = { teamId: teamId, playerId: playerId };
    return await this.enqueuePost(url, data);
  }

  public async updatePlayer(
    playerId: number,
    playerName: string,
    gender: PlayerGender,
  ): Promise<ApiResponse> {
    const url = this.getUrl("/api/player/update");
    const data = {
      playerId: playerId,
      gender: gender.toLowerCase(),
      name: playerName,
    };
    return await this.enqueuePost(url, data);
  }

  public async deleteTeam(teamId: number): Promise<ApiResponse> {
    return await this.simplePostWithOnlyTeamIdInBody(
      teamId,
      this.getUrl("/api/team/delete"),
    );
  }

  public async retireTeam(teamId: number): Promise<ApiResponse> {
    return await this.simplePostWithOnlyTeamIdInBody(
      teamId,
      this.getUrl("/api/team/retire"),
    );
  }

  public async activateTeam(teamId: number): Promise<ApiResponse> {
    return await this.simplePostWithOnlyTeamIdInBody(
      teamId,
      this.getUrl("/api/team/activate"),
    );
  }

  public async readyTeam(teamId: number, postData: any): Promise<ApiResponse> {
    const url = this.getUrl("/api/team/ready");
    postData["teamId"] = teamId;
    return await this.enqueuePost(url, postData);
  }

  public async unreadyTeam(teamId: number): Promise<ApiResponse> {
    return await this.simplePostWithOnlyTeamIdInBody(
      teamId,
      this.getUrl("/api/team/unready"),
    );
  }

  public async unretireTeam(teamId: number): Promise<ApiResponse> {
    return await this.simplePostWithOnlyTeamIdInBody(
      teamId,
      this.getUrl("/api/team/unretire"),
    );
  }

  public async redraftTeam(teamId: number): Promise<ApiResponse> {
    return await this.simplePostWithOnlyTeamIdInBody(
      teamId,
      this.getUrl("/api/team/redraft"),
    );
  }

  public async endSeason(teamId: number): Promise<ApiResponse> {
    return await this.simplePostWithOnlyTeamIdInBody(
      teamId,
      this.getUrl("/api/team/endSeason"),
    );
  }

  public async cancelRedraftTeam(teamId: number): Promise<ApiResponse> {
    return await this.simplePostWithOnlyTeamIdInBody(
      teamId,
      this.getUrl("/api/team/cancelRedraft"),
    );
  }

  public async completeRedrafting(teamId: number): Promise<ApiResponse> {
    return await this.simplePostWithOnlyTeamIdInBody(
      teamId,
      this.getUrl("/api/team/completeRedraft"),
    );
  }
  public async magicFixTeam(teamId: number): Promise<ApiResponse> {
    return await this.simplePostWithOnlyTeamIdInBody(
      teamId,
      this.getUrl("/api/team/magicfix"),
    );
  }

  public async skipTournament(teamId: number): Promise<ApiResponse> {
    return await this.simplePostWithOnlyTeamIdInBody(
      teamId,
      this.getUrl("/api/team/skipTournament"),
    );
  }

  public async getTeamStats(teamId: number): Promise<ApiResponse> {
    const url = this.getUrl("/api/team/stats/" + teamId);
    return await this.enqueuePost(url);
  }

  public async getTeamMatches(
    teamId: number,
    lastId: number = 0,
  ): Promise<ApiResponse> {
    const url = this.getUrl(
      "/api/team/matches/" + teamId + (lastId > 0 ? "/" + lastId : ""),
    );
    return await this.enqueuePost(url);
  }

  public async renumberPlayers(
    teamId: number,
    playerNumbers: any,
  ): Promise<ApiResponse> {
    const url = this.getUrl("/api/team/renumber");
    const data = { teamId, playerNumbers };
    return await this.enqueuePost(url, data);
  }

  public async getLog(teamId: number): Promise<ApiResponse> {
    const url = this.getUrl("/api/team/log/" + teamId);
    return await this.enqueuePost(url);
  }

  public async getSeasonConfig(season: number) {
    const url = this.getUrl("/api/boxtrophy/config/" + season);
    return await this.enqueuePost(url);
  }

  public async getSeasons(): Promise<ApiResponse> {
    const url = this.getUrl("/api/boxtrophy/seasons");
    return await this.enqueuePost(url);
  }

  public async getSeason(season: number | string): Promise<ApiResponse> {
    const url = this.getUrl("/api/boxtrophy/rosterData/" + Number(season));
    return await this.enqueuePost(url);
  }

  public async newSeason(): Promise<ApiResponse> {
    const url = this.getUrl("/api/boxtrophy/newSeason");
    return await this.enqueuePost(url);
  }

  public async setSeasonCost(
    season: number | string,
    roster: number,
    cost: number,
  ): Promise<ApiResponse> {
    const url = this.getUrl("/api/boxtrophy/setCost");
    const data = {
      season: Number(season),
      roster: roster,
      cost: cost,
    };
    return await this.enqueuePost(url, data);
  }

  public async getSeasonStats(season: number): Promise<ApiResponse> {
    const url = this.getUrl("/api/boxtrophy/stats/" + season);
    return await this.enqueuePost(url);
  }

  public async getSeasonStandings(season: number): Promise<ApiResponse> {
    const url = this.getUrl("/api/boxtrophy/standings?season=" + season);
    return await this.enqueuePost(url);
  }

  public async getSeasonTeamStandings(
    season: number,
    loadOwn: boolean,
  ): Promise<ApiResponse> {
    const url = this.getUrl(
      "/api/boxtrophy/teamStandings?season=" +
        season +
        (loadOwn ? "&own=1" : ""),
    );
    return await this.enqueuePost(url);
  }

  public async getSeasonIdtStandings(
    season: number,
    loadOwn: boolean,
  ): Promise<ApiResponse> {
    const url = this.getUrl(
      "/api/idt/teamStandings?season=" + season + (loadOwn ? "&own=1" : ""),
    );
    return await this.enqueuePost(url);
  }

  public async renameSquad(
    squadId: number,
    newName: string,
  ): Promise<ApiResponse> {
    const url = this.getUrl("/api/boxtrophy/renamesquad");
    const data = {
      squad: squadId,
      newName: newName,
    };

    return await this.enqueuePost(url, data);
  }

  public async setPlayoffState(
    teamId: number,
    newState: string,
  ): Promise<ApiResponse> {
    const url = this.getUrl("/api/boxtrophy/setPlayoffState");
    const data = {
      teamId: teamId,
      state: newState,
    };

    return await this.enqueuePost(url, data);
  }

  public async getBioCode(teamId: number) {
    const url = this.getUrl("/api/team/getBioCode/" + teamId);
    return await this.enqueuePost(url);
  }

  public async setTeamBio(
    teamId: number,
    newBio: string,
  ): Promise<ApiResponse> {
    const url = this.getUrl("/api/team/setBio");
    const data = {
      teamId: teamId,
      bio: newBio,
    };
    return await this.enqueuePost(url, data);
  }

  public async setTeamPriorities(teams: number[]): Promise<ApiResponse> {
    const url = this.getUrl("/api/boxtrophy/setPriorities");
    const data = {
      priorities: teams,
    };

    return await this.enqueuePost(url, data);
  }

  public async getSkillStatus(playerId: number): Promise<ApiResponse> {
    const url = this.getUrl("/api/player/skillstatus/" + playerId);
    return await this.enqueuePost(url);
  }

  public async getAllowedSkills(playerId: number): Promise<ApiResponse> {
    const url = this.getUrl("/api/player/allowedSkills/" + playerId);
    return await this.enqueuePost(url);
  }

  public async selectSkill2016(
    playerId: number,
    skillTypeId: number,
  ): Promise<ApiResponse> {
    const url = this.getUrl("/api/player/selectskill2016");

    const data = {
      playerId: playerId,
      skillTypeId: skillTypeId,
    };

    return await this.enqueuePost(url, data);
  }

  public async getIconData(positionId: number): Promise<ApiResponse> {
    const url = this.getUrl("/api/iconskeleton/icondata/" + positionId);

    return await this.enqueuePost(url);
  }

  public async getDashboardData(): Promise<ApiResponse> {
    const url = this.getUrl("/api/clickhouse/dashboardData");

    return await this.enqueuePost(url);
  }
}
