import { assertEquals } from "jsr:@std/assert";
import { Interceptor } from '../../core/base/events/Intercepted.ts';  // Adjust the import path

Deno.test("Event system should trigger 'foo' event", () => {
  const interceptor = new Interceptor<'foo' | 'bar'>();

  let fooResult = "";
  interceptor.on('foo', (value: string) => {
    fooResult = value;
  });

  interceptor.trigger('foo', 'Test Foo Event');
  
  assertEquals(fooResult, 'Test Foo Event');
});

Deno.test("Event system should trigger 'bar' event", () => {
  const interceptor = new Interceptor<'foo' | 'bar'>();

  let barResult = 0;
  interceptor.on('bar', (value: number) => {
    barResult = value;
  });

  interceptor.trigger('bar', 100);
  
  assertEquals(barResult, 100);
});

Deno.test("Event system should allow multiple listeners for the same event", () => {
  const interceptor = new Interceptor<'foo' | 'bar'>();

  let fooResult1 = "";
  let fooResult2 = "";

  interceptor.on('foo', (value: string) => {
    fooResult1 = value;
  });

  interceptor.on('foo', (value: string) => {
    fooResult2 = value;
  });

  interceptor.trigger('foo', 'Multiple Foo Listeners');

  assertEquals(fooResult1, 'Multiple Foo Listeners');
  assertEquals(fooResult2, 'Multiple Foo Listeners');
});

Deno.test("Event system should allow multiple listeners for the same event", () => {
    const interceptor = new Interceptor<'foo' | 'bar'>();
  
    let fooResult1 = "";
    let fooResult2 = "";
  
    interceptor.on('foo', (value) => {
      fooResult1 = value;
    });
  
    interceptor.on('foo', (value) => {
      fooResult2 = value;
    });
  
    interceptor.trigger('foo', 'Multiple Foo Listeners');
  
    assertEquals(fooResult1, 'Multiple Foo Listeners');
    assertEquals(fooResult2, 'Multiple Foo Listeners');
  });