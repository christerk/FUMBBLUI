import CategoryBase from "./categoryBase";

export default class TournamentSquads extends CategoryBase {
  protected readonly categoryPath = "tournamentsquads";

  public list() {
    return this.get(this.categoryPath, "list");
  }

  public create(data: {
    name: string;
    maxMembers: number;
    maxReserves: number;
  }) {
    return this.post(this.categoryPath, "create", data);
  }

  public disband(id: number) {
    return this.post(this.categoryPath, "disband", { squadId: id });
  }

  public getPendingRequests(): Promise<any> {
    return this.post(this.categoryPath, "pendingRequests");
  }

  public removeMember(squadId: number, teamId: number): Promise<any> {
    return this.post(this.categoryPath, "remove", {
      squadId: squadId,
      teamId: teamId,
    });
  }

  public cancelRequest(squadId: number, teamId: number): Promise<any> {
    return this.post(this.categoryPath, "cancelRequest", {
      squadId: squadId,
      teamId: teamId,
    });
  }

  public sendJoinRequest(squadId: number, teamId: number): Promise<any> {
    return this.post(this.categoryPath, "joinRequest", {
      squadId: squadId,
      teamId: teamId,
    });
  }

  public search(query: string): Promise<any> {
    return this.get(this.categoryPath, "search/" + encodeURIComponent(query));
  }

  public acceptRequestMember(squadId: number, teamId: number): Promise<any> {
    return this.post(this.categoryPath, "acceptRequest", {
      squadId: squadId,
      teamId: teamId,
      isReserve: false,
    });
  }

  public acceptRequestReserve(squadId: number, teamId: number): Promise<any> {
    return this.post(this.categoryPath, "acceptRequest", {
      squadId: squadId,
      teamId: teamId,
      isReserve: true,
    });
  }

  public declineRequest(squadId: number, teamId: number): Promise<any> {
    return this.post(this.categoryPath, "rejectRequest", {
      squadId: squadId,
      teamId: teamId,
    });
  }

  public swapTeam(
    squadId: number,
    teamId: number,
    otherTeamId: number | null,
  ): Promise<any> {
    return this.post(this.categoryPath, "swapTeam", {
      squadId: squadId,
      teamId: teamId,
      otherTeamId: otherTeamId,
    });
  }

  public rename(squadId: number, newName: string): Promise<any> {
    return this.post(this.categoryPath, "rename", {
      squadId: squadId,
      name: newName,
    });
  }
}
