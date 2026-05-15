using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NextGoalWins.Data.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Teams",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    ShortName = table.Column<string>(type: "nvarchar(5)", maxLength: 5, nullable: false),
                    PrimaryColor = table.Column<string>(type: "nvarchar(7)", maxLength: 7, nullable: false),
                    SecondaryColor = table.Column<string>(type: "nvarchar(7)", maxLength: 7, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Teams", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Matches",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Competition = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    HomeTeamId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    AwayTeamId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    KickoffUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    HomeScore = table.Column<int>(type: "int", nullable: false),
                    AwayScore = table.Column<int>(type: "int", nullable: false),
                    Minute = table.Column<int>(type: "int", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Matches", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Matches_Teams_AwayTeamId",
                        column: x => x.AwayTeamId,
                        principalTable: "Teams",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Matches_Teams_HomeTeamId",
                        column: x => x.HomeTeamId,
                        principalTable: "Teams",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Players",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TeamId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    Number = table.Column<int>(type: "int", nullable: false),
                    Position = table.Column<string>(type: "nvarchar(3)", maxLength: 3, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Players", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Players_Teams_TeamId",
                        column: x => x.TeamId,
                        principalTable: "Teams",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Games",
                columns: table => new
                {
                    Id = table.Column<string>(type: "nvarchar(6)", maxLength: 6, nullable: false),
                    MatchId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Games", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Games_Matches_MatchId",
                        column: x => x.MatchId,
                        principalTable: "Matches",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "EventConfigs",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    GameId = table.Column<string>(type: "nvarchar(6)", maxLength: 6, nullable: false),
                    EventType = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Label = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Points = table.Column<int>(type: "int", nullable: false),
                    Icon = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EventConfigs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_EventConfigs_Games_GameId",
                        column: x => x.GameId,
                        principalTable: "Games",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "MatchEvents",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    GameId = table.Column<string>(type: "nvarchar(6)", maxLength: 6, nullable: false),
                    EventType = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    PlayerId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PlayerName = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    Team = table.Column<string>(type: "nvarchar(4)", maxLength: 4, nullable: false),
                    Minute = table.Column<int>(type: "int", nullable: false),
                    OccurredAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MatchEvents", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MatchEvents_Games_GameId",
                        column: x => x.GameId,
                        principalTable: "Games",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_MatchEvents_Players_PlayerId",
                        column: x => x.PlayerId,
                        principalTable: "Players",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Participants",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    GameId = table.Column<string>(type: "nvarchar(6)", maxLength: 6, nullable: false),
                    Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    IsHost = table.Column<bool>(type: "bit", nullable: false),
                    Score = table.Column<int>(type: "int", nullable: false),
                    CorrectPredictions = table.Column<int>(type: "int", nullable: false),
                    JoinedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Participants", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Participants_Games_GameId",
                        column: x => x.GameId,
                        principalTable: "Games",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PointAwards",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    MatchEventId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ParticipantId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Points = table.Column<int>(type: "int", nullable: false),
                    AwardedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PointAwards", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PointAwards_MatchEvents_MatchEventId",
                        column: x => x.MatchEventId,
                        principalTable: "MatchEvents",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_PointAwards_Participants_ParticipantId",
                        column: x => x.ParticipantId,
                        principalTable: "Participants",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "Predictions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ParticipantId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    GameId = table.Column<string>(type: "nvarchar(6)", maxLength: 6, nullable: false),
                    EventType = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    PlayerId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Predictions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Predictions_Participants_ParticipantId",
                        column: x => x.ParticipantId,
                        principalTable: "Participants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Predictions_Players_PlayerId",
                        column: x => x.PlayerId,
                        principalTable: "Players",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "UX_EventConfigs_GameId_EventType",
                table: "EventConfigs",
                columns: new[] { "GameId", "EventType" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Games_MatchId",
                table: "Games",
                column: "MatchId");

            migrationBuilder.CreateIndex(
                name: "IX_Matches_AwayTeamId",
                table: "Matches",
                column: "AwayTeamId");

            migrationBuilder.CreateIndex(
                name: "IX_Matches_HomeTeamId",
                table: "Matches",
                column: "HomeTeamId");

            migrationBuilder.CreateIndex(
                name: "IX_MatchEvents_GameId",
                table: "MatchEvents",
                column: "GameId");

            migrationBuilder.CreateIndex(
                name: "IX_MatchEvents_PlayerId",
                table: "MatchEvents",
                column: "PlayerId");

            migrationBuilder.CreateIndex(
                name: "IX_Participants_GameId",
                table: "Participants",
                column: "GameId");

            migrationBuilder.CreateIndex(
                name: "IX_Players_TeamId",
                table: "Players",
                column: "TeamId");

            migrationBuilder.CreateIndex(
                name: "IX_PointAwards_MatchEventId",
                table: "PointAwards",
                column: "MatchEventId");

            migrationBuilder.CreateIndex(
                name: "IX_PointAwards_ParticipantId",
                table: "PointAwards",
                column: "ParticipantId");

            migrationBuilder.CreateIndex(
                name: "IX_Predictions_GameId",
                table: "Predictions",
                column: "GameId");

            migrationBuilder.CreateIndex(
                name: "IX_Predictions_PlayerId",
                table: "Predictions",
                column: "PlayerId");

            migrationBuilder.CreateIndex(
                name: "UX_Predictions_ParticipantId_EventType",
                table: "Predictions",
                columns: new[] { "ParticipantId", "EventType" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "EventConfigs");

            migrationBuilder.DropTable(
                name: "PointAwards");

            migrationBuilder.DropTable(
                name: "Predictions");

            migrationBuilder.DropTable(
                name: "MatchEvents");

            migrationBuilder.DropTable(
                name: "Participants");

            migrationBuilder.DropTable(
                name: "Players");

            migrationBuilder.DropTable(
                name: "Games");

            migrationBuilder.DropTable(
                name: "Matches");

            migrationBuilder.DropTable(
                name: "Teams");
        }
    }
}
