using NextGoalWins.Data;
using Microsoft.EntityFrameworkCore;

namespace NextGoalWins.Api.Middleware;

public class ParticipantTokenMiddleware(RequestDelegate next)
{
    public const string ParticipantKey = "Participant";

    public async Task InvokeAsync(HttpContext context, AppDbContext db)
    {
        // Only apply to routes that carry a {gameId} segment and require a token
        if (!context.Request.Headers.TryGetValue("X-Participant-Token", out var tokenHeader))
        {
            await next(context);
            return;
        }

        if (!Guid.TryParse(tokenHeader, out var participantId))
        {
            context.Response.StatusCode = StatusCodes.Status401Unauthorized;
            await context.Response.WriteAsJsonAsync(new { error = "InvalidToken", message = "X-Participant-Token is not a valid GUID." });
            return;
        }

        var participant = await db.Participants.FirstOrDefaultAsync(p => p.Id == participantId);
        if (participant is null)
        {
            context.Response.StatusCode = StatusCodes.Status401Unauthorized;
            await context.Response.WriteAsJsonAsync(new { error = "UnknownToken", message = "Participant not found." });
            return;
        }

        context.Items[ParticipantKey] = participant;
        await next(context);
    }
}
