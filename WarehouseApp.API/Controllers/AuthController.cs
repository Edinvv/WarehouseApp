using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using WarehouseApp.Domain.Entities;

namespace WarehouseApp.API.Controllers;


public record RegisterRequest(string FirstName, string LastName, string Email, string Password);
public record LoginRequest(string Email, string Password);
  [ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
      private readonly UserManager<AppUser> _userManager;
        private readonly IConfiguration _configuration;
        private readonly RoleManager<IdentityRole> _roleManager;
    public AuthController(UserManager<AppUser> userManager, IConfiguration configuration, RoleManager<IdentityRole> roleManager)
    {
      _userManager = userManager;
      _configuration = configuration;
      _roleManager = roleManager;

    }
    [HttpPost("register")]
public async Task<IActionResult> Register(RegisterRequest request)
    {
        var user = new AppUser
        {
             FirstName=request.FirstName,
            LastName=request.LastName,
            Email=request.Email,
            UserName=request.Email
         };
         var result = await _userManager.CreateAsync(user, request.Password);
         if (!result.Succeeded)
         {
             return BadRequest(result.Errors);
         }
         await _userManager.AddToRoleAsync(user, "Worker");
         return Ok();
    }
    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginRequest request)
    {
        var user = await _userManager.FindByEmailAsync(request.Email);
        if (user == null)
        {
            return Unauthorized();
        }
        var passwordValid = await _userManager.CheckPasswordAsync(user, request.Password);
        if (!passwordValid)
        {
            return Unauthorized();
        }
        return Ok(new
        {
            Token = await GenerateToken(user)
        });
    }
    private async Task<string> GenerateToken(AppUser user)
{
    var roles = await _userManager.GetRolesAsync(user);

    var claims = new List<Claim>
    {
        new Claim(ClaimTypes.NameIdentifier, user.Id),
        new Claim(ClaimTypes.Email, user.Email!),
    };

    foreach (var role in roles)
        claims.Add(new Claim(ClaimTypes.Role, role));

    var key = new SymmetricSecurityKey(
        Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]!));

    var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

    var token = new JwtSecurityToken(
        issuer: _configuration["Jwt:Issuer"],
        claims: claims,
        expires: DateTime.UtcNow.AddDays(
            int.Parse(_configuration["Jwt:ExpiryInDays"]!)),
        signingCredentials: creds);

    return new JwtSecurityTokenHandler().WriteToken(token);
}
 
}
