import CategoryBase from "./categoryBase";
import SerializedApiRunner from "./serializedApiRunner";

export default class TournamentSquads extends CategoryBase {
  protected categoryPath = "tournamentsquads";

  constructor(runner: SerializedApiRunner) {
    super(runner);
  }

  public async list() {
    return this.get(this.categoryPath, "list").then((res: any) => res.data);
  }

  public async create(data: {
    name: string;
    maxMembers: number;
    maxReserves: number;
  }) {
    return this.post(this.categoryPath, "create", data).then(
      (res: any) => res.data,
    );
  }

  public async disband(id: number) {
    return this.post(this.categoryPath, "disband", { squadId: id }).then(
      (res: any) => res.data,
    );
  }

  public async getPendingRequests(): Promise<any> {
    return this.post(this.categoryPath, "pendingRequests").then(
      (res: any) => res.data,
    );
  }

  public async removeMember(squadId: number, teamId: number): Promise<any> {
    return this.post(this.categoryPath, "remove", {
      squadId: squadId,
      teamId: teamId,
    }).then((res: any) => res.data);
  }

  public async cancelRequest(squadId: number, teamId: number): Promise<any> {
    return this.post(this.categoryPath, "cancelRequest", {
      squadId: squadId,
      teamId: teamId,
    }).then((res: any) => res.data);
  }

  public async sendJoinRequest(squadId: number, teamId: number): Promise<any> {
    return this.post(this.categoryPath, "joinRequest", {
      squadId: squadId,
      teamId: teamId,
    }).then((res: any) => res.data);
  }

  public async search(query: string): Promise<any> {
    return this.get(
      this.categoryPath,
      "search/" + encodeURIComponent(query),
    ).then((res: any) => res.data);
  }

  public async acceptRequestMember(
    squadId: number,
    teamId: number,
  ): Promise<any> {
    return this.post(this.categoryPath, "acceptRequest", {
      squadId: squadId,
      teamId: teamId,
      isReserve: false,
    }).then((res: any) => res.data);
  }

  public async acceptRequestReserve(
    squadId: number,
    teamId: number,
  ): Promise<any> {
    return this.post(this.categoryPath, "acceptRequest", {
      squadId: squadId,
      teamId: teamId,
      isReserve: true,
    }).then((res: any) => res.data);
  }

  public async declineRequest(squadId: number, teamId: number): Promise<any> {
    return this.post(this.categoryPath, "rejectRequest", {
      squadId: squadId,
      teamId: teamId,
    }).then((res: any) => res.data);
  }

  public async swapTeam(
    squadId: number,
    teamId: number,
    otherTeamId: number | null,
  ): Promise<any> {
    return this.post(this.categoryPath, "swapTeam", {
      squadId: squadId,
      teamId: teamId,
      otherTeamId: otherTeamId,
    }).then((res: any) => res.data);
  }

  public async rename(squadId: number, newName: string): Promise<any> {
    return this.post(this.categoryPath, "rename", {
      squadId: squadId,
      name: newName,
    }).then((res: any) => res.data);
  }
}
