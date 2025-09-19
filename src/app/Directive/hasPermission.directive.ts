import { Directive, Input, TemplateRef, ViewContainerRef } from '@angular/core';
import { AuthService } from '../core/auth.service';

@Directive({
  selector: '[hasPermission]'
})
export class HasPermissionDirective {
  private requiredPermission!: string;

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private authService: AuthService
  ) {}

  @Input() set hasPermission(permission: string) {
    this.requiredPermission = permission;

    const hasPermission = this.authService.hasPermission(permission);

    this.viewContainer.clear();
    if (hasPermission) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    }
  }
}
