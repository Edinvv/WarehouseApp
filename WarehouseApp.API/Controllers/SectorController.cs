using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WarehouseApp.Application.Features.Sectors.Commands;
using WarehouseApp.Application.Features.Sectors.Queries;

namespace WarehouseApp.API.Controllers;

    [ApiController]
    [Route("api/[controller]")]
    public class SectorController : ControllerBase
    {
        private readonly IMediator _mediator;

        public SectorController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet]
        public async Task<IActionResult> GetSectors()
        {
          var result = await _mediator.Send(new GetSectorsQuery());
            return Ok(result);
        }
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CreateSector( CreateSectorCommand command)
        {
            var result = await _mediator.Send(command);
            return Ok(result);
        }
    }

        
    