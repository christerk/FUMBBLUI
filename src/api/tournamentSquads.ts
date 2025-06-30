import CategoryBase from "./CategoryBase";

export default class TournamentSquads extends CategoryBase {
  protected categoryPath = "tournamentsquads";

  constructor(runner: SerializedApiRunner) {
    super(runner);
  }

  public list() {
    return this.get(this.categoryPath, "list").then((res) => res.data);
  }

  public create(data: {
    name: string;
    maxMembers: number;
    maxReserves: number;
  }) {
    return this.post(this.categoryPath, "create", data).then((res) => res.data);
  }

  public disband(id: number) {
    return this.post(this.categoryPath, "disband", { squadId: id }).then(
      (res) => res.data,
    );
  }

  public getPendingRequests() {
    return this.post(this.categoryPath, "pendingRequests").then(
      (res) => res.data,
    );
  }

  public removeMember(squadId: number, teamId: number) {
    return this.post(this.categoryPath, "remove", {
      squadId: squadId,
      teamId: teamId,
    }).then((res) => res.data);
  }

  public cancelRequest(squadId: number, teamId: number) {
    return this.post(this.categoryPath, "cancelRequest", {
      squadId: squadId,
      teamId: teamId,
    }).then((res) => res.data);
  }

  public sendJoinRequest(squadId: number, teamId: number) {
    return this.post(this.categoryPath, "joinRequest", {
      squadId: squadId,
      teamId: teamId,
    }).then((res) => res.data);
  }

  public search(query: string) {
    return this.get(
      this.categoryPath,
      "search/" + encodeURIComponent(query),
    ).then((res) => res.data);
  }

  public acceptRequestMember(squadId: number, teamId: number) {
    return this.post(this.categoryPath, "acceptRequest", {
      squadId: squadId,
      teamId: teamId,
      isReserve: false,
    }).then((res) => res.data);
  }

  public acceptRequestReserve(squadId: number, teamId: number) {
    return this.post(this.categoryPath, "acceptRequest", {
      squadId: squadId,
      teamId: teamId,
      isReserve: true,
    }).then((res) => res.data);
  }

  public declineRequest(squadId: number, teamId: number) {
    return this.post(this.categoryPath, "rejectRequest", {
      squadId: squadId,
      teamId: teamId,
    }).then((res) => res.data);
  }

  public swapTeam(squadId: number, teamId: number, otherTeamId: number | null) {
    return this.post(this.categoryPath, "swapTeam", {
      squadId: squadId,
      teamId: teamId,
      otherTeamId: otherTeamId,
    }).then((res) => res.data);
  }

  public rename(squadId: number, newName: string) {
    return this.post(this.categoryPath, "rename", {
      squadId: squadId,
      name: newName,
    }).then((res) => res.data);
  }
}
