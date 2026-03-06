To know if the user is authenticated, you can check the `User.Identity?.IsAuthenticated` property.

To get the user profile claims, you can use the `User.Claims` property:

```csharp title="Controllers/HomeController.cs"
var claims = User.Claims;

// Get the user ID
var userId = claims.FirstOrDefault(c => c.Type == MyEyesIDParameters.Claims.Subject)?.Value;
```

See [`MyEyesIDParameters.Claims`](https://github.com/myeyesid-io/csharp/blob/master/src/MyEyesID.AspNetCore.Authentication/MyEyesIDParameters.cs) for the list of claim names and their meanings.
