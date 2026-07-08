using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WarehouseApp.Application.Features.Comments.Commands;
using WarehouseApp.Application.Features.Comments.Queries;

namespace WarehouseApp.API.Controllers;

public record AddCommentRequest(Guid TaskId, string Content);

[ApiController]
[Route("api/[controller]")]
public class CommentsController : ControllerBase
{
    private readonly IMediator _mediator;
    public CommentsController(IMediator mediator) => _mediator = mediator;

    [HttpGet]
    [Authorize]
    public async Task<IActionResult> GetComments([FromQuery] Guid taskId)
    {
        var result = await _mediator.Send(new GetCommentsByTaskQuery(taskId));
        return Ok(result);
    }

    [HttpPost]
    [Authorize]
    public async Task<IActionResult> CreateComment(AddCommentRequest request)
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (userId == null) return Unauthorized();
        var result = await _mediator.Send(new AddCommentCommand(request.TaskId, request.Content, userId));
        return Ok(result);
    }
}