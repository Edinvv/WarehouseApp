using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WarehouseApp.Application.Features.Messages.Commands;
using WarehouseApp.Application.Features.Messages.Queries;

namespace WarehouseApp.API.Controllers;

public record SendMessageRequest(string ReceiverId, string Content);
[ApiController]
[Route("api/[controller]")]
    public class MessagesController : ControllerBase
    {
        private readonly IMediator _mediator;
        public MessagesController(IMediator mediator)
        {
            _mediator = mediator;
        }
[HttpGet]
[Authorize]
        public async Task<IActionResult> GetMessages([FromQuery] string otherUserId)
        {
             var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (userId == null)
            {
                return Unauthorized();
            }
            var messages = await _mediator.Send(new GetMessageQuery(userId, otherUserId));
            return Ok(messages);
        }
        [HttpPost]
        [Authorize]
        public async Task<IActionResult> SendMessage(SendMessageRequest request)
        {
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (userId == null)
            {
                return Unauthorized();
            }
            var result = await _mediator.Send(new SendMessageCommand(userId, request.ReceiverId, request.Content));
            return Ok(result);
        }
    }
