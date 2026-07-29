using System.Security.Claims;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WarehouseApp.Application.Features.OutboundOrders.Commands;
using WarehouseApp.Application.Features.OutboundOrders.Queries;

namespace WarehouseApp.API.Controllers;

public record CreateOutboundOrderRequest(string RestaurantName, List<OutboundOrderItemRequest> Items);
public record ReviewOutboundOrderRequest(bool IsApproved);

[ApiController]
[Route("api/[controller]")]
public class OutboundOrdersController : ControllerBase
{
    private readonly IMediator _mediator;
    public OutboundOrdersController(IMediator mediator) => _mediator = mediator;

    [HttpGet]
    [Authorize(Roles = "Admin,Supervisor")]
    public async Task<IActionResult> GetAll()
    {
        var result = await _mediator.Send(new GetOutboundOrdersQuery());
        return Ok(result);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create([FromBody] CreateOutboundOrderRequest request)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var id = await _mediator.Send(new CreateOutboundOrderCommand(request.RestaurantName, request.Items, userId));
        return Ok(id);
    }

    [HttpPost("{id}/review")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Review(Guid id, [FromBody] ReviewOutboundOrderRequest request)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var result = await _mediator.Send(new ReviewOutboundOrderCommand(id, request.IsApproved, userId));
        if (!result.Success) return result.Error == "Order not found." ? NotFound() : BadRequest(result.Error);
        return Ok();
    }

    [HttpPost("{id}/dispatch")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Dispatch(Guid id)
    {
        var result = await _mediator.Send(new DispatchOutboundOrderCommand(id));
        if (!result) return BadRequest("Not all pick tasks are completed yet.");
        return Ok();
    }
}