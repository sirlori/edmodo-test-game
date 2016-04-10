package main

import (
	"log"
	"net/http"
	"os"

	"github.com/labstack/echo"
	"github.com/labstack/echo/engine/standard"
	"github.com/labstack/echo/middleware"
)

func main() {
	e := echo.New()
	port := os.Getenv("PORT")

	if port == "" {
		log.Fatal("$PORT must be set")
	}

	e.Static("/", "static")

	e.Get("/", func(c echo.Context) error {
		return c.Redirect(http.StatusSeeOther, "/index.html")
	})

	e.Use(middleware.Logger())
	e.Use(middleware.Recover())

	e.Run(standard.New(":" + port))
}
