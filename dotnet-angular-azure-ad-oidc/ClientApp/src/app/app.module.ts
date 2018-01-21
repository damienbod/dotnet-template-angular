import { BrowserModule } from '@angular/platform-browser';
import { NgModule, APP_INITIALIZER } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';

import { AppComponent } from './app.component';
import { NavMenuComponent } from './nav-menu/nav-menu.component';
import { HomeComponent } from './home/home.component';

import {
  AuthModule,
  OidcSecurityService,
  OpenIDImplicitFlowConfiguration,
  OidcConfigService,
  AuthWellKnownEndpoints
} from 'angular-auth-oidc-client';
import { AutoLoginComponent } from './auto-login/auto-login.component';
import { routing } from './app.routes';
import { ForbiddenComponent } from './forbidden/forbidden.component';
import { UnauthorizedComponent } from './unauthorized/unauthorized.component';
import { ProtectedComponent } from './protected/protected.component';
import { AuthorizationGuard } from './authorization.guard';
import { environment } from '../environments/environment';

export function loadConfig(oidcConfigService: OidcConfigService) {
  console.log('APP_INITIALIZER STARTING');
  // https://login.microsoftonline.com/damienbod.onmicrosoft.com/.well-known/openid-configuration
  // https://login.microsoftonline.com/common/discovery/keys
  return () => oidcConfigService.load_using_custom_stsServer('https://localhost:44347/well-known-openid-configuration.json');
}

@NgModule({
  declarations: [
    AppComponent,
    NavMenuComponent,
    HomeComponent,
    AutoLoginComponent,
    ForbiddenComponent,
    UnauthorizedComponent,
    ProtectedComponent
  ],
  imports: [
    BrowserModule.withServerTransition({ appId: 'ng-cli-universal' }),
    HttpClientModule,
    AuthModule.forRoot(),
    FormsModule,
    routing,
  ],
  providers: [
	  OidcSecurityService,
	  OidcConfigService,
	  {
		  provide: APP_INITIALIZER,
		  useFactory: loadConfig,
		  deps: [OidcConfigService],
		  multi: true
    },
    AuthorizationGuard
	],
  bootstrap: [AppComponent]
})

export class AppModule {

  constructor(
    private oidcSecurityService: OidcSecurityService,
    private oidcConfigService: OidcConfigService,
  ) {
    this.oidcConfigService.onConfigurationLoaded.subscribe(() => {

      const openIDImplicitFlowConfiguration = new OpenIDImplicitFlowConfiguration();
      openIDImplicitFlowConfiguration.stsServer = 'https://login.microsoftonline.com/damienbod.onmicrosoft.com';
      openIDImplicitFlowConfiguration.redirect_url = 'https://localhost:44347';
      openIDImplicitFlowConfiguration.client_id = 'fd87184a-00c2-4aee-bc72-c7c1dd468e8f';
      openIDImplicitFlowConfiguration.response_type = 'id_token token';
      openIDImplicitFlowConfiguration.scope = 'openid profile email ';
      openIDImplicitFlowConfiguration.post_logout_redirect_uri = 'https://localhost:44347';
      openIDImplicitFlowConfiguration.post_login_route = '/home';
      openIDImplicitFlowConfiguration.forbidden_route = '/home';
      openIDImplicitFlowConfiguration.unauthorized_route = '/home';
      openIDImplicitFlowConfiguration.auto_userinfo = false;
      openIDImplicitFlowConfiguration.log_console_warning_active = true;
      openIDImplicitFlowConfiguration.log_console_debug_active = !environment.production;
      openIDImplicitFlowConfiguration.max_id_token_iat_offset_allowed_in_seconds = 600;


      const authWellKnownEndpoints = new AuthWellKnownEndpoints();
      authWellKnownEndpoints.setWellKnownEndpoints(this.oidcConfigService.wellKnownEndpoints);

      this.oidcSecurityService.setupModule(openIDImplicitFlowConfiguration, authWellKnownEndpoints);
      this.oidcSecurityService.setCustomRequestParameters({ 'prompt': 'admin_consent', 'resource': 'https://graph.windows.net'});
    });

    console.log('APP STARTING');
  }
}
