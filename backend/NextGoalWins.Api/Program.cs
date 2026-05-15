using Microsoft.EntityFrameworkCore;
using NextGoalWins.Api.Hubs;
using NextGoalWins.Api.Middleware;
using NextGoalWins.Core.Interfaces;
using NextGoalWins.Core.Services;
using NextGoalWins.Data;
using NextGoalWins.Data.Repositories;
using NextGoalWins.Data.Seed;

var builder = WebApplication.CreateBuilder(args);

// ── Database ─────────────────────────────────────────────────────────────────
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("Default")));

// ── Repositories & Services ───────────────────────────────────────────────────
builder.Services.AddScoped<IGameRepository, GameRepository>();
builder.Services.AddScoped<IMatchRepository, MatchRepository>();
builder.Services.AddScoped<IGameService, GameService>();
builder.Services.AddScoped<IMatchService, MatchService>();
builder.Services.AddScoped<IGameHubNotifier, GameHubNotifier>();
builder.Services.AddScoped<DatabaseSeeder>();

// ── SignalR ───────────────────────────────────────────────────────────────────
builder.Services.AddSignalR();

// ── Controllers & OpenAPI ─────────────────────────────────────────────────────
builder.Services.AddControllers()
    .AddJsonOptions(opts =>
    {
        opts.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
    });

builder.Services.AddOpenApi();

// ── CORS ──────────────────────────────────────────────────────────────────────
var allowedOrigins = builder.Configuration.GetSection("AllowedOrigins").Get<string[]>() ?? [];
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
        policy.WithOrigins(allowedOrigins)
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials()); // required for SignalR
});

var app = builder.Build();

// ── Seed database on startup ──────────────────────────────────────────────────
using (var scope = app.Services.CreateScope())
{
    var seeder = scope.ServiceProvider.GetRequiredService<DatabaseSeeder>();
    await seeder.SeedAsync();
}

// ── Middleware pipeline ───────────────────────────────────────────────────────
if (app.Environment.IsDevelopment())
    app.MapOpenApi();

app.UseCors();
app.UseMiddleware<ParticipantTokenMiddleware>();
app.MapControllers();
app.MapHub<GameHub>("/hubs/game");

app.Run();
