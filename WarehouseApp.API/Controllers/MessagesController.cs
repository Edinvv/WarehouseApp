using System.Security.Claims;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using WarehouseApp.Application.Features.Messages.Commands;
using WarehouseApp.Application.Features.Messages.Queries;
using WarehouseApp.Domain.Entities;

namespace WarehouseApp.API.Controllers;

public record SendMessageRequest(string ReceiverId, string Content);

[ApiController]
[Route("api/[controller]")]
public class MessagesController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly UserManager<AppUser> _userManager;

    public MessagesController(IMediator mediator, UserManager<AppUser> userManager)
    {
        _mediator = mediator;
        _userManager = userManager;
    }

    [HttpGet]
    [Authorize]
    public async Task<IActionResult> GetMessages([FromQuery] string otherUserId)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userId == null) return Unauthorized();
        var messages = await _mediator.Send(new GetMessageQuery(userId, otherUserId));
        return Ok(messages);
    }

    [HttpPost]
    [Authorize]
    public async Task<IActionResult> SendMessage(SendMessageRequest request)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userId == null) return Unauthorized();

        var sender = await _userManager.FindByIdAsync(userId);
        var senderName = sender != null ? $"{sender.FirstName} {sender.LastName}".Trim() : "Someone";

        var result = await _mediator.Send(new SendMessageCommand(userId, request.ReceiverId, request.Content, senderName));
        return Ok(result);
    }
}