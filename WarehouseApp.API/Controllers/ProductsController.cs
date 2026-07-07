using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WarehouseApp.Application.Features.Products.Commands;
using WarehouseApp.Application.Features.Products.Queries;
namespace WarehouseApp.API.Controllers;

    [ApiController]
    [Route("api/[controller]")]
    public class ProductsController : ControllerBase
    {
        private readonly IMediator _mediator;
        public ProductsController(IMediator mediator)
        {
            _mediator = mediator;
        }
        [HttpGet]
        public async Task<IActionResult> GetProducts(Guid sectorId)
        {
         var result = await _mediator.Send(new GetProductsBySectorIdQuery(sectorId));
    return Ok(result);
        }

        [HttpPost]
        [Authorize(Roles = "Admin,Supervisor")]
        public async Task<IActionResult> CreateProduct(CreateProductCommand command)
        {
            var result= await _mediator.Send(command);
            return Ok(result);
        }
    }
