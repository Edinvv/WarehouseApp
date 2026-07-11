using MediatR;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WarehouseApp.Application.Features.InBoundOrders.Commands;
using WarehouseApp.Application.Features.InBoundOrders.Queries;


namespace WarehouseApp.API.Controllers;
[ApiController]
[Route("api/[controller]")]
[Authorize]
    public class InboundOrdersController : ControllerBase
    {
         private readonly IMediator _mediator;
    public InboundOrdersController(IMediator mediator) => _mediator = mediator;
    [HttpGet]

    public async Task<IActionResult> GetOrders()
    {
        var result = await _mediator.Send(new GetInboundOrdersQuery());
        return Ok(result);
    }
    [HttpPost]
    [Authorize (Roles = "Admin,Supervisor")]
    public async Task<IActionResult> CreateOrder(CreateInboundOrderCommand command)
    {
        var order = await _mediator.Send(command);
        return Ok (order);
    }
    [HttpPost("{id}/review")]
[Authorize(Roles = "Admin")]
public async Task<IActionResult> ReviewOrder ( Guid id,[FromBody] ReviewInboundOrderCommand command)
    {
       var result = await _mediator.Send(command with {InboundOrderId=id});
         if (!result) return NotFound();
          return NoContent();
    }
    [HttpPost("{id}/arrived")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeliveryArrived(Guid id)
    {
        var callerId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var result = await _mediator.Send(new DeliveryArrivedCommand(id, callerId));
        if (!result) return NotFound();
        return NoContent();
    }

    [HttpPost("{id}/complete")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> CompleteOrder(Guid id)
    {
        var result = await _mediator.Send(new CompleteInboundOrderCommand(id));
        return result switch
        {
            CompleteOrderResult.Success => NoContent(),
            CompleteOrderResult.NotFound => NotFound(),
            CompleteOrderResult.TasksNotComplete => BadRequest("Not all restock tasks are completed yet."),
            _ => BadRequest()
        };
    }
}

