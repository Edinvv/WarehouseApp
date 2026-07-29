using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WarehouseApp.Application.Features.Stock.Queries;

namespace WarehouseApp.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class StockController : ControllerBase
{
    private readonly IMediator _mediator;
    public StockController(IMediator mediator) => _mediator = mediator;

    [HttpGet]
    [Authorize]
    public async Task<IActionResult> GetStock([FromQuery] Guid? sectorId)
    {
        var result = await _mediator.Send(new GetStockQuery(sectorId));
        return Ok(result);
    }
}