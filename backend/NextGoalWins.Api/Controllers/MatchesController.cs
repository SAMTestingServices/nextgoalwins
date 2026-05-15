using Microsoft.AspNetCore.Mvc;
using NextGoalWins.Api.Mapping;
using NextGoalWins.Core.Interfaces;

namespace NextGoalWins.Api.Controllers;

[ApiController]
[Route("api/matches")]
public class MatchesController(IMatchService matchService) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken ct)
    {
        var matches = await matchService.GetAvailableMatchesAsync(ct);
        return Ok(matches.Select(m => m.ToDto()));
    }
}
